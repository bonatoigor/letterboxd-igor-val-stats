import { useState } from "react";
import { Plus, Film, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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

const RATING_OPTIONS = Array.from({ length: 11 }, (_, i) => i * 0.5);

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
  const [open, setOpen] = useState(false);
  const [slug, setSlug] = useState("");
  const [ratingI, setRatingI] = useState(0);
  const [ratingV, setRatingV] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [stagedFilms, setStagedFilms] = useState<{slug: string, rating_i: number, rating_v: number}[]>([]);

  const handleStageFilm = () => {
    if (!slug.trim()) return;
    setStagedFilms([...stagedFilms, { slug: slug.trim(), rating_i: ratingI, rating_v: ratingV }]);
    setSlug("");
    setRatingI(0);
    setRatingV(0);
  };
  
  const handleSubmit = async () => {
    if (stagedFilms.length === 0) return;
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("trigger-film-update", {
        body: { films: stagedFilms }, 
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-lb-green hover:bg-lb-green/80 text-black font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-3 h-3" />
          Add Movie
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-lb-surface border-border/50 w-[95vw] max-w-md rounded-2xl p-6 overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lb-bright flex items-center gap-2 text-lg">
            <Film className="w-5 h-5 text-lb-green" />
            Log New Film
          </DialogTitle>
          <DialogDescription className="text-lb-text/70 text-xs">
            Insira o slug do Letterboxd e as notas individuais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="text-[11px] text-lb-text uppercase tracking-wider mb-2 block font-semibold">
              Letterboxd Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: everything-everywhere-all-at-once"
              className="w-full bg-lb-body/50 border border-border/30 rounded-lg px-4 py-2.5 text-sm text-lb-bright placeholder:text-lb-text/30 focus:outline-none focus:ring-2 focus:ring-lb-green/20 focus:border-lb-green/50 transition-all"
              disabled={status === "loading"}
            />
          </div>

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
            disabled={!slug.trim()}
            className="w-full border-lb-green/30 text-lb-green hover:bg-lb-green/10"
          >
            + Adicionar à lista de envio
          </Button>
        
          {stagedFilms.length > 0 && (
            <div className="bg-black/20 rounded-lg p-3 space-y-2">
              <p className="text-[10px] uppercase text-lb-text/50 font-bold">Prontos para enviar:</p>
              {stagedFilms.map((f, i) => (
                <div key={i} className="flex justify-between text-xs text-lb-bright border-b border-white/5 pb-1">
                  <span>{f.slug}</span>
                  <span className="text-lb-green">{f.rating_i} / {f.rating_v}</span>
                </div>
              ))}
            </div>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={!slug.trim() || status === "loading"}
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
      </DialogContent>
    </Dialog>
  );
}
