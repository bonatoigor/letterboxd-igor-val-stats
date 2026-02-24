import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FailedFilm } from "@/lib/filmUtils";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function FailedFilmsAlert({ films }: { films: FailedFilm[] }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (films.length === 0) return null;

  const handleRetryAll = async () => {
    setLoading(true);
    try {
      for (const film of films) {
        await supabase.functions.invoke("trigger-film-update", {
          body: { 
            slug: film.slug, 
            rating_i: film.rating_i, 
            rating_v: film.rating_v 
          },
        });
      }
      toast({
        title: "Reprocessamento iniciado",
        description: `${films.length} filmes foram enviados para a fila do GitHub.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao reprocessar",
        description: "Não foi possível disparar o workflow.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="text-red-400 w-5 h-5" />
        <div>
          <p className="text-red-400 text-sm font-semibold">
            Bloqueio detectado pelo Letterboxd
          </p>
          <p className="text-red-400/70 text-xs">
            Temos {films.length} filme(s) aguardando reprocessamento manual.
          </p>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleRetryAll}
        disabled={loading}
        className="border-red-500/30 text-red-400 hover:bg-red-500/20 gap-2"
      >
        <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Re-tentar tudo
      </Button>
    </div>
  );
}
