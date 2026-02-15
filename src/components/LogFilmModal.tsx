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

export default function LogFilmModal() {
  const [open, setOpen] = useState(false);
  const [slugs, setSlugs] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!slugs.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("trigger-film-update", {
        body: { slugs: slugs.trim() },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        setMessage(`Workflow disparado! Slugs: ${data.slugs}`);
        setSlugs("");
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
      <DialogContent className="bg-lb-surface border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lb-bright flex items-center gap-2">
            <Film className="w-4 h-4 text-lb-green" />
            Log New Films
          </DialogTitle>
          <DialogDescription className="text-lb-text text-xs">
            Digite os slugs dos filmes do Letterboxd separados por espaço.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[11px] text-lb-text uppercase tracking-wider mb-1.5 block">
              Film Slugs
            </label>
            <textarea
              value={slugs}
              onChange={(e) => setSlugs(e.target.value)}
              placeholder="ex: the-godfather parasite spirited-away"
              className="w-full bg-lb-body border border-border/50 rounded-md p-3 text-sm text-lb-bright placeholder:text-lb-text/40 focus:outline-none focus:ring-1 focus:ring-lb-green/50 resize-none h-24"
              disabled={status === "loading"}
            />
            <p className="text-[10px] text-lb-text/60 mt-1">
              O slug é o final da URL do filme no Letterboxd (ex: letterboxd.com/film/<strong>the-godfather</strong>)
            </p>
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 text-xs p-3 rounded-md border ${
                status === "success"
                  ? "bg-green-950/20 text-green-400 border-green-900/30"
                  : "bg-red-950/20 text-red-400 border-red-900/30"
              }`}
            >
              {status === "success" ? (
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!slugs.trim() || status === "loading"}
            className="w-full bg-lb-green hover:bg-lb-green/80 text-black font-semibold"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Disparando workflow...
              </>
            ) : (
              "Adicionar Filmes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
