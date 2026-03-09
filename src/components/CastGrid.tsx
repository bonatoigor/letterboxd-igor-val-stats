import { useState, useEffect } from "react";
import { FrequencyItem } from "@/lib/filmUtils";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface CastGridProps {
  data: FrequencyItem[];
  onActorClick?: (name: string) => void;
}

interface ActorPhoto {
  name: string;
  photo: string | null;
}

export default function CastGrid({ data, onActorClick }: CastGridProps) {
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      const cacheKey = "cast_photos_cache";
      const cacheTimeKey = "cast_photos_cache_time";
      const cached = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      const ONE_DAY = 24 * 60 * 60 * 1000;

      // Use cache if less than 1 day old and has all actors
      if (cached && cachedTime && Date.now() - Number(cachedTime) < ONE_DAY) {
        try {
          const parsed = JSON.parse(cached);
          const allPresent = data.every((d) => d.name in parsed);
          if (allPresent) {
            setPhotos(parsed);
            setLoading(false);
            return;
          }
        } catch {}
      }

      try {
        const { data: result, error } = await supabase.functions.invoke("search-actor", {
          body: { actors: data.map((d) => d.name) },
        });

        if (error) throw error;

        const photoMap: Record<string, string | null> = {};
        (result.results as ActorPhoto[]).forEach((r) => {
          photoMap[r.name] = r.photo;
        });
        setPhotos(photoMap);
        localStorage.setItem(cacheKey, JSON.stringify(photoMap));
        localStorage.setItem(cacheTimeKey, String(Date.now()));
      } catch (err) {
        console.error("Failed to fetch actor photos:", err);
      } finally {
        setLoading(false);
      }
    };

    if (data.length > 0) fetchPhotos();
  }, [data]);

  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6 md:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm uppercase tracking-widest text-lb-text font-medium">Cast</h3>
        <span className="text-xs uppercase tracking-widest text-lb-green font-semibold">Most Watched</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6">
        {data.map((actor) => {
          const photo = photos[actor.name];
          return (
            <button
              key={actor.name}
              onClick={() => onActorClick?.(actor.name)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-lb-green transition-colors bg-lb-bar">
                {loading ? (
                  <div className="w-full h-full animate-pulse bg-lb-bar" />
                ) : photo ? (
                  <img
                    src={photo}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-lb-text" />
                  </div>
                )}
              </div>
              <div className="text-center min-w-0">
                <p className="text-xs sm:text-sm text-lb-bright font-medium leading-tight line-clamp-2">
                  {actor.name}
                </p>
                <p className="text-[10px] sm:text-xs text-lb-green mt-0.5">
                  {actor.count}&nbsp;{actor.count === 1 ? "film" : "films"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
