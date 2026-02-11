interface DecadeChartProps {
  data: { name: string; count: number }[];
}

export default function DecadeChart({ data }: DecadeChartProps) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">
        Films by Decade
      </h3>
      <div className="flex items-end gap-1 md:gap-2" style={{ height: '10rem' }}>
        {data.map((d) => {
          const barHeight = max > 0 ? (d.count / max) * 100 : 0;
          return (
            <div key={d.name} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
              <span className="text-[10px] text-lb-text tabular-nums">{d.count}</span>
              <div
                className="w-full bg-gradient-to-t from-lb-green to-lb-blue rounded-t transition-all duration-500"
                style={{ height: `${barHeight}%`, minHeight: d.count > 0 ? "4px" : "0" }}
              />
                <span className="text-xs md:text-sm font-medium text-lb-text truncate w-full text-center mt-1">
                  {d.name}
                </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
