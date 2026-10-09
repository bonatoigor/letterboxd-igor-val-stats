import { useMemo, useState } from "react";
import { EyeOff } from "lucide-react";
import { Movie, getRecommendations } from "@/lib/filmUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";

interface WatchNextGridProps {
  movies: Movie[];
}

// Films marked as seen stay hidden on this device until the queue workflow (every 3h)
// adds them to watch_next_excluded.json and the new deploy goes live.
const HIDDEN_KEY = "lb_watch_next_hidden";

const readHidden = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeHidden = (slugs: string[]) => {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(slugs));
  } catch {
    // Storage unavailable: hiding only lasts for this session.
  }
};

export default function WatchNextGrid({ movies }: WatchNextGridProps) {
  const { authed } = useAdminAuth();
  const { toast } = useToast();
  const [hidden, setHidden] = useState<string[]>(readHidden);
  const recommendations = useMemo(() => getRecommendations(movies, 18, 3, hidden), [movies, hidden]);

  const updateHidden = (update: (prev: string[]) => string[]) => {
    setHidden((prev) => {
      const next = update(prev);
      writeHidden(next);
      return next;
    });
  };

  const markAsSeen = async (slug: string, title: string) => {
    updateHidden((prev) => [...prev, slug]);
    // Reuses the queue function; process_queue.py turns -1/-1 entries into Watch Next exclusions.
    const { error } = await supabase.functions.invoke("trigger-film-update", {
      body: { films: [{ slug, rating_i: -1, rating_v: -1 }] },
    });
    if (error) {
      updateHidden((prev) => prev.filter((s) => s !== slug));
      toast({ title: "Não foi possível excluir", description: title, variant: "destructive" });
    } else {
      toast({ title: "Removido do Watch Next", description: title });
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Watch Next</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {recommendations.map(({ film, because }) => {
          const slug = film.slug ?? film.url;
          return (
            <a
              key={film.url}
              href={film.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-lb-bar">
                <img
                  src={film.poster ?? ""}
                  alt={film.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {because.length > 1 && (
                  <span className="absolute top-1 right-1 bg-black/75 text-lb-green text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                    ×{because.length}
                  </span>
                )}
                {authed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAsSeen(slug, film.title);
                    }}
                    title="Já vi / não quero"
                    className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 bg-black/80 hover:bg-black text-lb-bright text-[10px] font-semibold py-1 rounded"
                  >
                    <EyeOff className="w-3 h-3" /> Já vi
                  </button>
                )}
              </div>
              <p className="text-[11px] text-lb-bright font-medium leading-tight line-clamp-1 mt-1.5">
                {film.title}
                {film.year && <span className="text-lb-text font-normal"> {film.year}</span>}
              </p>
              <p className="text-[10px] text-lb-text leading-tight line-clamp-2">
                because of <span className="text-lb-bright">{because[0].Film_title}</span>
                {because.length > 1 && ` +${because.length - 1}`}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
