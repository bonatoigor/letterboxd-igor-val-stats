import { GeneralInfo } from "@/lib/filmUtils";

interface ProfileHeaderProps {
  info: GeneralInfo;
  totalMovies: number;
  totalHours: number;
  totalDays: number;
  uniqueDirectors: number;
  uniqueCountries: number;
  uniqueLanguages: number;
  globalSumRating: string;
}

const START_DATE = new Date('2024-03-23');

export default function ProfileHeader({
  info,
  totalMovies,
  totalHours,
  totalDays,
  uniqueDirectors,
  uniqueCountries,
  uniqueLanguages,
  globalSumRating,
}: ProfileHeaderProps) {
    const calculateFrequency = () => {
    const today = new Date();
    const diffInTime = today.getTime() - START_DATE.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return (diffInDays / totalMovies).toFixed(1);
  };

  const daysPerMovie = calculateFrequency();
  
  return (
    <header className="relative overflow-hidden bg-lb-body border-b border-border">

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <DecorativeBars side="left" />
        <DecorativeBars side="right" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
        <h1 className="text-center font-display text-4xl md:text-6xl text-lb-bright tracking-tight mb-4">
          A Life in Film
        </h1>

        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex flex-col items-center">
            <img
              src={info.Avatar_Igor}
              alt="Igor"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-lb-green object-cover shadow-lg"
            />
            <span className="text-lg md:text-lg font-semibold text-lb-text mt-3">Igor</span>
          </div>

          <div className="flex flex-col items-center mx-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-lb-blue flex items-center justify-center bg-lb-surface">
              <div className="text-center">
                <span className="text-2xl md:text-3xl font-bold text-lb-blue">
                  {info.Compatibility}
                </span>
                <span className="text-xs text-lb-blue">%</span>
              </div>
            </div>
            <span className="text-xs text-lb-text mt-2 uppercase tracking-widest">
              Compatibility
            </span>
          </div>

          <div className="flex flex-col items-center">
            <img
              src={info.Avatar_Valeria}
              alt="Valeria"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-lb-orange object-cover shadow-lg"
            />
            <span className="text-lg md:text-lg font-semibold text-lb-text mt-3">Valéria</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          <MetricCard value={totalMovies} label="Films" icon="🎬" />
          <MetricCard value={totalHours} label="Hours" icon="⏱" isDecimal={true} />
          <MetricCard value={totalDays} label="Days" icon="📅" isDecimal={true} />
          <MetricCard value={uniqueDirectors} label="Directors" icon="🎥" />
          <MetricCard value={uniqueCountries} label="Countries" icon="🌍" />
          <MetricCard value={uniqueLanguages} label="Languages" icon="🗣" />
        </div>

        <div className="flex justify-center gap-8 md:gap-16 mt-8">
          <Stat value={info.Sum_Rating_Igor.toFixed(1)} label="Igor ★" />

          <div className="text-center">
              <span className="block text-2xl md:text-3xl font-bold text-lb-blue">{globalSumRating}</span>
              <span className="text-xs text-lb-text uppercase tracking-widest">Global Average ★</span>
          </div>
          
          <Stat value={info.Sum_Rating_Valeria.toFixed(1)} label="Valéria ★" />
        </div>
        <div className="mt-10 text-center">
          <p className="text-lb-text/80 text-sm md:text-base font-medium tracking-wide italic">
            "1 film every {daysPerMovie} days"
          </p>
          <p className="text-[10px] text-lb-text/40 uppercase tracking-[0.2em] mt-1">
            Since March 23, 2024
          </p>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ value, label, icon, isDecimal = false }: { value: number; label: string; icon: string; isDecimal?: boolean }) {
  return (
    <div className="bg-lb-surface rounded-lg p-4 text-center border border-border/50">
      <span className="text-lg mb-1 block">{icon}</span>
      <span className="block text-2xl md:text-3xl font-bold text-lb-bright tabular-nums">
        {isDecimal 
          ? value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
          : Math.floor(value).toLocaleString()
        }
      </span>
      <span className="text-xs text-lb-text uppercase tracking-widest">{label}</span>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="block text-2xl md:text-3xl font-bold text-lb-bright">{value}</span>
      <span className="text-xs md:text-sm text-lb-text uppercase tracking-wider">{label}</span>
    </div>
  );
}

function DecorativeBars({ side = "right" }: { side?: "left" | "right" }) {
  const bars = Array.from({ length: 18 }, (_, i) => ({
    x: i * 20,
    green: 40 + Math.random() * 80,
    blue: 20 + Math.random() * 60,
    orange: 20 + Math.random() * 50,
    offsetY: 40 + Math.random() * 80,
  }));

  const positionClass = side === "right" ? "right-0" : "left-0 -scale-x-100";

  return (
    <svg
      className={`absolute top-0 h-full w-80 hidden md:block ${positionClass}`}
      viewBox="0 0 320 390"
      preserveAspectRatio="none"
    >
      <g fill="none">
        {bars.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.offsetY})`}>
            <rect fill="hsl(145 100% 44%)" y={b.blue + 8} width="4" height={b.green} rx="2" />
            <rect fill="hsl(197 89% 60%)" width="4" height={b.blue} rx="2" />
            <rect fill="hsl(30 100% 50%)" y={b.blue + b.green + 16} width="4" height={b.orange} rx="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}
