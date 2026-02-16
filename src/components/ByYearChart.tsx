import { useState, useMemo } from "react";
import { Movie } from "@/lib/filmUtils";

interface ByYearChartProps {
  movies: Movie[];
}

export default function ByYearChart({ movies }: ByYearChartProps) {
  const [tab, setTab] = useState<"films" | "ratings">("films");

  const yearData = useMemo(() => {
    const byYear: Record<number, { count: number; ratingSum: number }> = {};
    movies.forEach((m) => {
      if (!byYear[m.Release_year]) byYear[m.Release_year] = { count: 0, ratingSum: 0 };
      byYear[m.Release_year].count += 1;
      const avg = ((m.Rating_Igor || 0) + (m.Rating_Valeria || 0)) / 2;
      byYear[m.Release_year].ratingSum += avg;
    });

    const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
    if (years.length === 0) return [];

    // Fill gaps
    const result: { year: number; count: number; avgRating: number }[] = [];
    for (let y = years[0]; y <= years[years.length - 1]; y++) {
      const d = byYear[y];
      result.push({
        year: y,
        count: d?.count || 0,
        avgRating: d ? d.ratingSum / d.count : 0,
      });
    }
    return result;
  }, [movies]);

  const maxCount = Math.max(...yearData.map((d) => d.count), 1);
  const maxRating = 5;
  const firstYear = yearData[0]?.year;
  const lastYear = yearData[yearData.length - 1]?.year;

  return (
    <div className="bg-lb-surface rounded-lg p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-sm uppercase tracking-widest text-lb-text font-medium">By Year</h3>
        <div className="flex-1 h-px bg-lb-green/30" />
        <nav className="flex gap-4">
          <button
            onClick={() => setTab("films")}
            className={`text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === "films" ? "text-lb-blue" : "text-lb-text/50 hover:text-lb-text"
            }`}
          >
            Films
          </button>
          <button
            onClick={() => setTab("ratings")}
            className={`text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors ${
              tab === "ratings" ? "text-lb-orange" : "text-lb-text/50 hover:text-lb-text"
            }`}
          >
            Ratings
          </button>
        </nav>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Dashed average line */}
        <div className="absolute left-0 right-0 border-t border-dashed border-lb-text/20" style={{ bottom: "2rem" }} />

        <div className="flex items-end gap-px" style={{ height: "12rem" }}>
          {yearData.map((d) => {
            const value = tab === "films" ? d.count : d.avgRating;
            const max = tab === "films" ? maxCount : maxRating;
            const barHeight = max > 0 ? (value / max) * 100 : 0;

            const barColor =
              tab === "films"
                ? "bg-gradient-to-t from-lb-green to-lb-blue"
                : "bg-lb-orange";

            return (
              <div
                key={d.year}
                className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-lb-body border border-white/10 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  <span className="text-[10px] text-lb-bright font-medium">
                    {d.year}: {tab === "films" ? `${d.count} films` : `★ ${d.avgRating.toFixed(1)}`}
                  </span>
                </div>
                <div
                  className={`w-full ${barColor} rounded-t transition-all duration-500 group-hover:brightness-125`}
                  style={{
                    height: `${barHeight}%`,
                    minHeight: value > 0 ? "3px" : "0",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Year labels */}
        <div className="flex justify-between mt-2">
          <span className="text-xs sm:text-sm font-medium text-lb-text">{firstYear}</span>
          <span className="text-xs sm:text-sm font-medium text-lb-text">{lastYear}</span>
        </div>
      </div>
    </div>
  );
}
