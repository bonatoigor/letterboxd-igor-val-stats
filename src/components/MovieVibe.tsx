import { Badge } from "@/components/ui/badge";
import vibe1 from "@/assets/vibe-1.jpg";
import vibe2 from "@/assets/vibe-2.jpg";
import vibe3 from "@/assets/vibe-3.jpg";
import vibe4 from "@/assets/vibe-4.jpg";
import vibe5 from "@/assets/vibe-5.jpg";

interface KeywordItem {
  word: string;
  count: number;
}

interface MovieVibeProps {
  keywords: KeywordItem[];
}

const sizeClasses = [
  "text-lg sm:text-xl font-bold",
  "text-base sm:text-lg font-bold",
  "text-sm sm:text-base font-semibold",
  "text-xs sm:text-sm font-medium",
  "text-[11px] sm:text-xs font-normal",
];

const colorClasses = [
  "bg-lb-green/20 text-lb-green border-lb-green/30",
  "bg-lb-blue/20 text-lb-blue border-lb-blue/30",
  "bg-lb-orange/20 text-lb-orange border-lb-orange/30",
  "bg-lb-green/15 text-lb-green/80 border-lb-green/20",
  "bg-lb-blue/15 text-lb-blue/80 border-lb-blue/20",
  "bg-lb-orange/15 text-lb-orange/80 border-lb-orange/20",
];

const vibeImages = [
  { src: vibe1, label: "Love & Drama" },
  { src: vibe2, label: "War & Power" },
  { src: vibe3, label: "Mystery & Truth" },
  { src: vibe4, label: "Adventure & Discovery" },
  { src: vibe5, label: "Loss & Memory" },
];

export default function MovieVibe({ keywords }: MovieVibeProps) {
  if (!keywords.length) return null;

  const max = keywords[0].count;

  return (
    <section className="bg-lb-surface rounded-lg p-4 sm:p-6">
      <h3 className="text-sm sm:text-base font-semibold text-lb-bright mb-4 uppercase tracking-wider">
        The Movie Vibe
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {keywords.map((kw, i) => {
          const ratio = kw.count / max;
          const sizeIdx = ratio > 0.7 ? 0 : ratio > 0.5 ? 1 : ratio > 0.35 ? 2 : ratio > 0.2 ? 3 : 4;
          const colorIdx = i % colorClasses.length;

          return (
            <Badge
              key={kw.word}
              variant="outline"
              className={`${sizeClasses[sizeIdx]} ${colorClasses[colorIdx]} px-2.5 sm:px-3 py-1 sm:py-1.5 cursor-default transition-transform hover:scale-110`}
            >
              {kw.word}
            </Badge>
          );
        })}
      </div>

      <div className="mt-5 sm:mt-6">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {vibeImages.map((img) => (
            <div key={img.label} className="relative group overflow-hidden rounded-md">
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-20 sm:h-28 md:h-36 object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1.5 sm:pb-2">
                <span className="text-[9px] sm:text-[11px] text-lb-bright font-medium tracking-wide">
                  {img.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
