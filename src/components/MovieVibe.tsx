import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

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
  "bg-zinc-900 text-zinc-400 border-zinc-800",
  "bg-red-950/20 text-red-500 border-red-900/30",
  "bg-blue-950/20 text-blue-500 border-blue-900/30",
  "bg-stone-900 text-stone-500 border-stone-800",
];

export default function MovieVibe({ keywords }: MovieVibeProps) {
  const [seed, setSeed] = useState(Date.now());
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  
  if (!keywords.length) return null;

useEffect(() => {
    if (keywords.length >= 10) {
      const visualStyles = ["dark,atmosphere", "noir,shadow", "cinematic,gloomy"];
      const getRandomWords = (count: number) => {
        return [...keywords]
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .map(k => k.word.trim())
          .join(",");
      };
      
      const prompts = [
        `${visualStyles[0]},${getRandomWords(5)}`,
        `${visualStyles[1]},${getRandomWords(5)}`,
        `${visualStyles[2]},${getRandomWords(5)}`,
      ];
      setImagePrompts(prompts);
    }
  }, [keywords, seed]);

  if (!keywords.length) return null;

  const handleRefresh = () => {
    setSeed(Date.now());
  };

  const max = keywords[0].count;

  return (
    <section className="bg-lb-surface rounded-lg p-4 sm:p-6 border border-border/50 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm sm:text-base font-semibold text-lb-bright uppercase tracking-wider">
          The Movie Vibe
        </h3>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-lb-text hover:text-lb-blue transition-colors group"
        >
          <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          Refresh Vibe
        </button>
      </div>
      
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {imagePrompts.map((prompt, idx) => (
          <div key={`${seed}-${idx}`} className="relative group overflow-hidden rounded-lg bg-lb-body aspect-[3/4] border border-white/5">
            <img
              src={`https://loremflickr.com/600/800/${prompt}/all?sig=${seed + (idx * 147)}`}
              alt="Movie Vibe"
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110 brightness-50 group-hover:brightness-75"
              loading="lazy"
              key={`${seed}-${idx}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] text-lb-bright font-bold uppercase tracking-widest bg-black/60 px-2 py-1 rounded self-start backdrop-blur-sm border border-white/10 mb-2">
                 Vibe Match
               </span>
               <p className="text-[9px] text-lb-text/70 leading-relaxed italic line-clamp-2">
                 {prompt.replace(/,/g, " • ")}
               </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
