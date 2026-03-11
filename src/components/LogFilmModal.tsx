import { useState } from "react";
import { Plus, Film, Loader2, CheckCircle, AlertCircle, Lock, LogOut, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "loading" | "success" | "error";
type SearchResult = { slug: string; title: string; year: string };

const RATING_OPTIONS = Array.from({ length: 11 }, (_, i) => i * 0.5);
const AUTH_KEY = "lb_admin_auth";

function useAdminAuth() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const login = (user: string, pass: string) => {
    if (user === "igorbonato" && pass === "C@melodromo12") {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };
  return { authed, login, logout };
}

function StarRating({ value, onChange, label, color }: { value: number; onChange: (v: number) => void; label: string; color: string }) {
  return (
    <div className="w-full">
      <label className="text-[11px] text-lb-text uppercase tracking-wider mb-2 block font-semibold">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {RATING_OPTIONS.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`flex items-center justify-center w-[34px] h-[34px] rounded-md transition-all text-[11px] font-bold border ${
              value === star
                ? `${color} border-current bg-white/5 scale-105 shadow-sm`
                : "text-lb-text/40 border-border/20 hover:text-lb-text/70 hover:border-border/40 bg-transparent"
            }`}
          >
            {star === 0 ? "–" : star}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LogFilmModal() {
  const { authed, login, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState(false);
  
  // Mode: search vs manual slug
  const [mode, setMode] = useState<"search" | "manual">("search");
  
  // Search fields
  const [filmName, setFilmName] = useState("");
  const [filmYear, setFilmYear] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  
  // Manual slug
  const [manualSlug, setManualSlug] = useState("");
  
  const [ratingI, setRatingI] = useState(0);
  const [ratingV, setRatingV] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [stagedFilms, setStagedFilms] = useState<{slug: string, title: string, rating_i: number, rating_v: number}[]>([]);

  const handleSearch = async () => {
    if (!filmName.trim()) return;
    setSearching(true);
    setSearchResults([]);
    setSelectedSlug("");
    setSelectedTitle("");

    try {
      const { data, error } = await supabase.functions.invoke("search-film", {
        body: { name: filmName.trim(), year: filmYear.trim() || undefined },
      });

      if (error) throw error;

      if (data?.results?.length > 0) {
        setSearchResults(data.results);
        // Auto-select first result
        setSelectedSlug(data.results[0].slug);
        setSelectedTitle(`${data.results[0].title} (${data.results[0].year})`);
      } else {
        setMessage("Nenhum filme encontrado. Tente outro nome.");
        setStatus("error");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erro na busca");
      setStatus("error");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (r: SearchResult) => {
    setSelectedSlug(r.slug);
    setSelectedTitle(`${r.title} (${r.year})`);
  };

  const handleStageFilm = () => {
    const slug = mode === "manual" ? manualSlug.trim() : selectedSlug;
    const title = mode === "manual" ? manualSlug.trim() : selectedTitle;
    if (!slug) return;
    setStagedFilms([...stagedFilms, { slug, title, rating_i: ratingI, rating_v: ratingV }]);
    setFilmName("");
    setFilmYear("");
    setSelectedSlug("");
    setSelectedTitle("");
    setManualSlug("");
    setSearchResults([]);
    setRatingI(0);
    setRatingV(0);
  };
  
  const handleSubmit = async () => {
    if (stagedFilms.length === 0) return;
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("trigger-film-update", {
        body: { films: stagedFilms.map(f => ({ slug: f.slug, rating_i: f.rating_i, rating_v: f.rating_v })) }, 
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        setMessage(`${stagedFilms.length} filmes enviados para a fila de processamento!`);
        setStagedFilms([]);
      } else {
        throw new Error(data?.error || "Erro ao processar");
      }
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Erro ao disparar workflow");
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setStatus("idle");
      setMessage("");
      setSearchResults([]);
      setSelectedSlug("");
      setSelectedTitle("");
    }
  };

  const handleLogin = () => {
    if (login(loginUser, loginPass)) {
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-lb-green hover:bg-lb-green/80 text-black font-bold shadow-lg active:scale-95 transition-transform md:gap-1.5 md:text-[10px] md:uppercase md:tracking-widest w-8 h-8 p-0 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-full md:rounded-md"
        >
          <Plus className="w-4 h-4 md:w-3 md:h-3" />
          <span className="hidden md:inline">Add Movie</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-lb-surface border-border/50 w-[95vw] max-w-md rounded-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {!authed ? (
          <>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lb-bright flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-lb-orange" />
                Admin Login
              </DialogTitle>
              <DialogDescription className="text-lb-text/70 text-xs">
                Faça login para adicionar filmes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="Usuário"
                className="w-full bg-lb-body/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-lb-bright placeholder:text-lb-text/30 focus:outline-none focus:ring-2 focus:ring-lb-green/20 focus:border-lb-green/50 transition-all"
              />
              <input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Senha"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-lb-body/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-lb-bright placeholder:text-lb-text/30 focus:outline-none focus:ring-2 focus:ring-lb-green/20 focus:border-lb-green/50 transition-all"
              />
              {loginError && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Credenciais inválidas.
                </p>
              )}
              <Button onClick={handleLogin} className="w-full bg-lb-green hover:bg-lb-green/90 text-black font-bold h-11 rounded-xl">
                Entrar
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lb-bright flex items-center gap-2 text-lg">
                  <Film className="w-5 h-5 text-lb-green" />
                  Log New Film
                </DialogTitle>
                <button onClick={logout} className="text-lb-text/50 hover:text-red-400 transition-colors" title="Sair">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <DialogDescription className="text-lb-text/70 text-xs">
                Pesquise pelo nome ou insira o slug manualmente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("search")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${
                    mode === "search"
                      ? "bg-lb-green/15 text-lb-green border-lb-green/30"
                      : "text-lb-text/50 border-border/20 hover:text-lb-text/70"
                  }`}
                >
                  🔍 Buscar por Nome
                </button>
                <button
                  onClick={() => setMode("manual")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg border transition-all ${
                    mode === "manual"
                      ? "bg-lb-green/15 text-lb-green border-lb-green/30"
                      : "text-lb-text/50 border-border/20 hover:text-lb-text/70"
                  }`}
                >
                  ✏️ Slug Manual
                </button>
              </div>
              {/* Search fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-lb-text uppercase tracking-wider mb-2 block font-semibold">
                    Nome do Filme
                  </label>
                  <input
                    value={filmName}
                    onChange={(e) => setFilmName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="ex: Everything Everywhere All at Once"
                    className="w-full bg-lb-body/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-lb-bright placeholder:text-lb-text/30 focus:outline-none focus:ring-2 focus:ring-lb-green/20 focus:border-lb-green/50 transition-all"
                    disabled={status === "loading"}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-28">
                    <label className="text-[11px] text-lb-text uppercase tracking-wider mb-2 block font-semibold">
                      Ano
                    </label>
                    <input
                      value={filmYear}
                      onChange={(e) => setFilmYear(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="1994"
                      maxLength={4}
                      className="w-full bg-lb-body/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-lb-bright placeholder:text-lb-text/30 focus:outline-none focus:ring-2 focus:ring-lb-green/20 focus:border-lb-green/50 transition-all"
                      disabled={status === "loading"}
                    />
                  </div>
                  <div className="flex items-end flex-1">
                    <Button
                      onClick={handleSearch}
                      disabled={!filmName.trim() || searching}
                      className="w-full bg-lb-green/20 hover:bg-lb-green/30 text-lb-green font-bold h-[42px] rounded-lg border border-lb-green/30"
                    >
                      {searching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-1.5" />
                          Buscar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="bg-black/20 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  <p className="text-[10px] uppercase text-lb-text/50 font-bold px-2 pt-1">Resultados:</p>
                  {searchResults.map((r) => (
                    <button
                      key={r.slug}
                      onClick={() => handleSelectResult(r)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                        selectedSlug === r.slug
                          ? "bg-lb-green/15 text-lb-green border border-lb-green/30"
                          : "text-lb-bright hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <span className="font-medium">{r.title}</span>
                      {r.year && <span className="text-lb-text/50 ml-2">({r.year})</span>}
                      <span className="text-lb-text/30 text-[10px] block mt-0.5">{r.slug}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected film indicator */}
              {selectedSlug && (
                <div className="flex items-center gap-2 text-xs text-lb-green bg-lb-green/5 border border-lb-green/20 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Selecionado: <strong>{selectedTitle}</strong></span>
                </div>
              )}

              <div className="space-y-6">
                <StarRating value={ratingI} onChange={setRatingI} label="Igor ★" color="text-lb-green" />
                <StarRating value={ratingV} onChange={setRatingV} label="Valéria ★" color="text-lb-orange" />
              </div>

              {message && (
                <div
                  className={`flex items-start gap-3 text-xs p-3.5 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
                    status === "success"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span className="leading-relaxed">{message}</span>
                </div>
              )}

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleStageFilm}
                disabled={!selectedSlug}
                className="w-full border-lb-green/30 text-lb-green hover:bg-lb-green/10"
              >
                + Adicionar à lista de envio
              </Button>
            
              {stagedFilms.length > 0 && (
                <div className="bg-black/20 rounded-lg p-3 space-y-2">
                  <p className="text-[10px] uppercase text-lb-text/50 font-bold">Prontos para enviar:</p>
                  {stagedFilms.map((f, i) => (
                    <div key={i} className="flex justify-between text-xs text-lb-bright border-b border-white/5 pb-1">
                      <span>{f.title}</span>
                      <span className="text-lb-green">{f.rating_i} / {f.rating_v}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={stagedFilms.length === 0 || status === "loading"}
                className="w-full bg-lb-green hover:bg-lb-green/90 text-black font-bold h-11 rounded-xl shadow-lg shadow-lb-green/10 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Add to Stats"
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
