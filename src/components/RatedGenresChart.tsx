import { RatedGenre } from "@/lib/filmUtils";

interface RatedGenresChartProps {
  data: RatedGenre[];
}

export default function RatedGenresChart({ data }: RatedGenresChartProps) {
  const maxRating = 5;

  return (
    <div className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">
        Highest Rated Genres
      </h3>
      <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                {/* Nome do Gênero: de text-sm para text-base */}
                <span className="text-base text-lb-bright truncate mr-3 font-medium">
                  {item.name}
                </span>
                {/* Notas: de text-xs para text-sm e fonte mais negritada */}
                <div className="flex gap-3 text-sm font-bold tabular-nums">
                  <span className="text-lb-green">I: {item.avgIgor.toFixed(1)}★</span>
                  <span className="text-lb-orange">V: {item.avgValeria.toFixed(1)}★</span>
                </div>
              </div>
              <div className="flex gap-1.5 h-2"> {/* Aumentado gap e altura da barra para h-2 */}
                <div className="flex-1 bg-lb-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lb-green rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(item.avgIgor / maxRating) * 100}%` }}
                  />
                </div>
                <div className="flex-1 bg-lb-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lb-orange rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(item.avgValeria / maxRating) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
