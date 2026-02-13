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
  "bg-lb-green/20 text-lb-green border-lb-green/30",
  "bg-lb-blue/20 text-lb-blue border-lb-blue/30",
  "bg-lb-orange/20 text-lb-orange border-lb-orange/30",
  "bg-lb-green/15 text-lb-green/80 border-lb-green/20",
  "bg-lb-blue/15 text-lb-blue/80 border-lb-blue/20",
  "bg-lb-orange/15 text-lb-orange/80 border-lb-orange/20",
];

export default function MovieVibe({ keywords }: MovieVibeProps) {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000));
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);
  
  if (!keywords.length) return null;

useEffect(() => {
    if (keywords.length >= 10) {
      const group1 = keywords.slice(0, 5).map(k => k.word).join(", ");
      const group2 = keywords.slice(5, 10).map(k => k.word).join(", ");
      const group3 = keywords.slice(10, 15).map(k => k.word).join(", ");
      
      setImagePrompts([group1, group2, group3]);
    }
  }, [keywords]);

  if (!keywords.length) return null;

  const handleRefresh = () => {
    setSeed(Math.floor(Math.random() * 1000));
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

     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {imagePrompts.map((prompt, idx) => (
          <div key={idx} className="relative group overflow-hidden rounded-lg bg-lb-body aspect-[3/4] border border-white/5">
            <img
              src={`https://image.pollinations.ai/prompt/cinematic%20movie%20still%20photography%20representing%20${encodeURIComponent(prompt)}?width=600&height=800&seed=${seed + idx}&model=flux&nologo=true`}
              alt="Movie Vibe"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&h=800&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
               <p className="text-[10px] text-lb-bright/70 leading-relaxed italic">
                 Mix: {prompt}
               </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
