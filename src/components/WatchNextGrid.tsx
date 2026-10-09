import { Recommendation } from "@/lib/filmUtils";

interface WatchNextGridProps {
  recommendations: Recommendation[];
}

export default function WatchNextGrid({ recommendations }: WatchNextGridProps) {
  if (recommendations.length === 0) return null;

  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Watch Next</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {recommendations.map(({ film, because }) => (
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
        ))}
      </div>
    </section>
  );
}
