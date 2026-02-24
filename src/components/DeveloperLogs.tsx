import { useState } from "react";
import { Terminal, ChevronUp, ChevronDown, RotateCw, Trash2 } from "lucide-react";
import { FailedFilm } from "@/lib/filmUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperLogs({ films }: { films: FailedFilm[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const handleRetry = async () => {
    setIsRetrying(true);
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
      toast({ title: "Signal sent to GitHub Actions", description: "Reprocessing queue..." });
    } catch (err) {
      toast({ variant: "destructive", title: "Execution failed" });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center">
      {/* Botão de Trigger (Minimizado) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1a1a1a] border-t border-x border-white/10 px-4 py-1.5 rounded-t-lg flex items-center gap-2 text-[10px] font-mono text-lb-text/60 hover:text-lb-bright transition-colors shadow-2xl"
      >
        <Terminal className="w-3 h-3" />
        SYSTEM LOGS {films.length > 0 && <span className="text-red-500">({films.length} ERR)</span>}
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {/* Janela de Logs */}
      {isOpen && (
        <div className="w-full max-w-5xl bg-[#0f0f0f] border-t border-white/10 h-64 overflow-hidden flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Console Output</span>
            <div className="flex gap-4">
              <button 
                onClick={handleRetry}
                disabled={isRetrying || films.length === 0}
                className="text-[10px] font-mono text-lb-green hover:underline flex items-center gap-1 disabled:opacity-30"
              >
                <RotateCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} /> RUN_RETRY_QUEUE
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 custom-scrollbar">
            {films.length === 0 ? (
              <p className="text-white/20 italic font-light tracking-tight">No issues detected. System status: NOMINAL.</p>
            ) : (
              films.map((film, idx) => (
                <div key={idx} className="flex flex-col border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-bold">[ERROR]</span>
                    <span className="text-white/60">{film.timestamp}</span>
                    <span className="text-lb-blue underline">{film.slug}</span>
                  </div>
                  <p className="text-white/30 pl-4 break-all">
                    Payload: {"{"} r_i: {film.rating_i}, r_v: {film.rating_v} {"}"} | Status: 403_FORBIDDEN_IP_BLOCK
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
