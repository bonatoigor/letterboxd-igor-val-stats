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
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-lb-bright truncate mr-3">{item.name}</span>
              <div className="flex gap-3 text-xs tabular-nums">
                <span className="text-lb-green">I: {item.avgIgor.toFixed(1)}★</span>
                <span className="text-lb-orange">V: {item.avgValeria.toFixed(1)}★</span>
              </div>
            </div>
            <div className="flex gap-1 h-1.5">
              <div className="flex-1 bg-lb-bar rounded-full overflow-hidden">
                <div
                  className="h-full bg-lb-green rounded-full"
                  style={{ width: `${(item.avgIgor / maxRating) * 100}%` }}
                />
              </div>
              <div className="flex-1 bg-lb-bar rounded-full overflow-hidden">
                <div
                  className="h-full bg-lb-orange rounded-full"
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
