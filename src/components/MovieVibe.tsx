import { Badge } from "@/components/ui/badge";

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

export default function MovieVibe({ keywords }: MovieVibeProps) {
  if (!keywords.length) return null;

  const max = keywords[0].count;

  return (
    <section className="bg-lb-surface rounded-lg p-4 sm:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">
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
    </section>
  );
}
