import { GeneralInfo } from "@/lib/filmUtils";

interface ProfileHeaderProps {
  info: GeneralInfo;
  totalMovies: number;
}

export default function ProfileHeader({ info, totalMovies }: ProfileHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-lb-body border-b border-border">
      {/* Decorative bars pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <DecorativeBars />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-16">
        <h1 className="text-center font-display text-3xl md:text-5xl text-lb-bright tracking-tight mb-2">
          A Life in Film
        </h1>

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex flex-col items-center">
            <img
              src={info.Avatar_Igor}
              alt="Igor"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-lb-green object-cover"
            />
            <span className="text-sm text-lb-text mt-2">Igor</span>
          </div>

          <div className="flex flex-col items-center mx-4">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-lb-green flex items-center justify-center bg-lb-surface">
                <div className="text-center">
                  <span className="text-2xl md:text-3xl font-bold text-lb-green">{info.Compatibility}</span>
                  <span className="text-xs text-lb-green">%</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-lb-text mt-2 uppercase tracking-widest">Compatibility</span>
          </div>

          <div className="flex flex-col items-center">
            <img
              src={info.Avatar_Valeria}
              alt="Valeria"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-lb-orange object-cover"
            />
            <span className="text-sm text-lb-text mt-2">Valéria</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-8 md:gap-16 mt-8">
          <Stat value={totalMovies.toString()} label="Films" />
          <Stat value={info.Sum_Rating_Igor.toFixed(1)} label="Igor ★" />
          <Stat value={info.Sum_Rating_Valeria.toFixed(1)} label="Valéria ★" />
        </div>
      </div>
    </header>
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

function DecorativeBars() {
  const bars = Array.from({ length: 18 }, (_, i) => ({
    x: i * 20,
    green: 40 + Math.random() * 80,
    blue: 20 + Math.random() * 60,
    orange: 20 + Math.random() * 50,
    offsetY: 40 + Math.random() * 80,
  }));

  return (
    <svg className="absolute right-0 top-0 h-full w-80 hidden md:block" viewBox="0 0 320 390" preserveAspectRatio="none">
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
