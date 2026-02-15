import { useState } from "react";
import { Plus, Film, Loader2, CheckCircle, AlertCircle, Star } from "lucide-react";
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

function StarRating({ value, onChange, label, color }: { value: number; onChange: (v: number) => void; label: string; color: string }) {
  return (
    <div>
      <label className="text-[11px] text-lb-text uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-all text-sm font-bold border ${
              value === star
                ? `${color} border-current scale-110`
                : "text-lb-text/40 border-border/30 hover:text-lb-text/70 hover:border-border/60"
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

  const handleSubmit = async () => {
    if (!slug.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("trigger-film-update", {
        body: { slug: slug.trim(), rating_i: ratingI, rating_v: ratingV },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        setMessage(`Workflow disparado! Slug: ${data.slug}`);
        setSlug("");
        setRatingI(0);
        setRatingV(0);
      } else {
        throw new Error(data?.error || "Erro desconhecido");
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
          className="gap-1.5 bg-lb-green hover:bg-lb-green/80 text-black font-semibold text-xs uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          Log
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-lb-surface border-border/50 w-[90vw] max-w-sm rounded-xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lb-bright flex items-center gap-2 text-base">
            <Film className="w-4 h-4 text-lb-green" />
            Log Film
          </DialogTitle>
          <DialogDescription className="text-lb-text text-xs">
            Slug do filme + notas de cada um.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[11px] text-lb-text uppercase tracking-wider mb-1.5 block">
              Film Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ex: the-godfather"
              className="w-full bg-lb-body border border-border/50 rounded-md px-3 py-2 text-sm text-lb-bright placeholder:text-lb-text/40 focus:outline-none focus:ring-1 focus:ring-lb-green/50"
              disabled={status === "loading"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StarRating value={ratingI} onChange={setRatingI} label="Igor ★" color="text-lb-green" />
            <StarRating value={ratingV} onChange={setRatingV} label="Valéria ★" color="text-lb-orange" />
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 text-xs p-2.5 rounded-md border ${
                status === "success"
                  ? "bg-green-950/20 text-green-400 border-green-900/30"
                  : "bg-red-950/20 text-red-400 border-red-900/30"
              }`}
            >
              {status === "success" ? (
                <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!slug.trim() || status === "loading"}
            className="w-full bg-lb-green hover:bg-lb-green/80 text-black font-semibold"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Adicionar Filme"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
