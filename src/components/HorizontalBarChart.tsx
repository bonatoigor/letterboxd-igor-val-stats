import { FrequencyItem } from "@/lib/filmUtils";

interface HorizontalBarChartProps {
  title: string;
  data: FrequencyItem[];
  color: "green" | "blue" | "orange";
}

const colorMap = {
  green: "bg-lb-green",
  blue: "bg-lb-blue",
  orange: "bg-lb-orange",
};

const textColorMap = {
  green: "text-lb-green",
  blue: "text-lb-blue",
  orange: "text-lb-orange",
};

export default function HorizontalBarChart({ title, data, color }: HorizontalBarChartProps) {
  return (
    <div className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">{title}</h3>
      <div className="space-y-2.5">
       {data.map((item) => (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <span className="text-sm sm:text-base text-lb-bright truncate mr-2 sm:mr-3 font-medium">
                {item.name}
              </span>
              <span className={`text-xs sm:text-sm font-bold ${textColorMap[color]} tabular-nums shrink-0`}>
                {item.count}
              </span>
            </div>
            <div className="h-2 bg-lb-bar rounded-full overflow-hidden">
              <div
                className={`h-full ${colorMap[color]} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
