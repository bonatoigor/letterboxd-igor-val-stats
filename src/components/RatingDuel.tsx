import { CriticGapItem, GenreRatingGap, RaterStats, RatingBucket } from "@/lib/filmUtils";

interface RatingDuelProps {
  stats: { igor: RaterStats; valeria: RaterStats };
  distribution: RatingBucket[];
  genreGaps: GenreRatingGap[];
  criticGap: { above: CriticGapItem[]; below: CriticGapItem[] };
}

const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;

function StatColumn({ name, stats, color }: { name: string; stats: RaterStats; color: string }) {
  return (
    <div className="flex-1 text-center">
      <p className={`text-xs uppercase tracking-widest font-medium ${color}`}>{name}</p>
      <p className="text-2xl sm:text-3xl font-bold text-lb-bright tabular-nums">{stats.avg.toFixed(2)}★</p>
      <p className="text-[11px] text-lb-text tabular-nums">±{stats.stdDev.toFixed(2)} spread</p>
      <p className="text-[11px] text-lb-text tabular-nums">{signed(stats.vsCommunity)} vs Letterboxd</p>
    </div>
  );
}

function CriticList({ title, items }: { title: string; items: CriticGapItem[] }) {
  return (
    <div>
      <p className="text-xs text-lb-text mb-2">{title}</p>
      <div className="space-y-2">
        {items.map(({ movie, coupleAvg, gap }) => (
          <a
            key={movie.id}
            href={movie.Film_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            <img src={movie.Poster_Movie} alt={movie.Film_title} className="w-8 h-12 object-cover rounded shrink-0" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-lb-bright font-medium truncate group-hover:underline">{movie.Film_title}</p>
              <p className="text-[11px] text-lb-text tabular-nums">
                Us {coupleAvg.toFixed(2)}★ · LB {movie.Average_rating.toFixed(2)}★
              </p>
            </div>
            <span className={`text-xs font-bold tabular-nums shrink-0 ${gap >= 0 ? "text-lb-green" : "text-lb-orange"}`}>
              {signed(gap)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function RatingDuel({ stats, distribution, genreGaps, criticGap }: RatingDuelProps) {
  const maxBucket = Math.max(1, ...distribution.flatMap((b) => [b.igor, b.valeria]));
  const harsher =
    stats.igor.avg === stats.valeria.avg ? null : stats.igor.avg < stats.valeria.avg ? "Igor" : "Valéria";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-lb-surface rounded-lg p-5 md:p-6">
        <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Who's the Harsher Critic</h3>
        <div className="flex gap-4 mb-2">
          <StatColumn name="Igor" stats={stats.igor} color="text-lb-green" />
          <StatColumn name="Valéria" stats={stats.valeria} color="text-lb-orange" />
        </div>
        {harsher && (
          <p className="text-center text-xs text-lb-text mb-4">
            <span className="text-lb-bright font-medium">{harsher}</span> rates lower on average
          </p>
        )}
        <div className="flex items-end gap-1 h-28 md:h-44">
          {distribution.map((b) => (
            <div key={b.rating} className="flex-1 flex flex-col items-center h-full">
              <div className="flex-1 w-full flex items-end justify-center gap-px">
                <div
                  className="w-1/2 bg-lb-green rounded-t-sm transition-all duration-700 ease-out"
                  style={{ height: `${(b.igor / maxBucket) * 100}%` }}
                  title={`Igor: ${b.igor} films at ${b.rating}★`}
                />
                <div
                  className="w-1/2 bg-lb-orange rounded-t-sm transition-all duration-700 ease-out"
                  style={{ height: `${(b.valeria / maxBucket) * 100}%` }}
                  title={`Valéria: ${b.valeria} films at ${b.rating}★`}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-lb-text mt-1 tabular-nums">{b.rating}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-lb-surface rounded-lg p-5 md:p-6">
        <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Where Tastes Differ</h3>
        <div className="space-y-3">
          {genreGaps.map((g) => (
            <div key={g.name}>
              <div className="flex items-center justify-between mb-1.5 text-xs sm:text-sm font-bold tabular-nums">
                <span className="text-lb-green">{g.avgIgor.toFixed(1)}★</span>
                <span className="text-lb-bright font-medium truncate mx-2">
                  {g.name} <span className="text-lb-text font-normal text-[11px]">({g.count})</span>
                </span>
                <span className="text-lb-orange">{g.avgValeria.toFixed(1)}★</span>
              </div>
              <div className="flex gap-1 h-2">
                <div className="flex-1 bg-lb-bar rounded-full overflow-hidden flex justify-end">
                  <div
                    className="h-full bg-lb-green rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(g.avgIgor / 5) * 100}%` }}
                  />
                </div>
                <div className="flex-1 bg-lb-bar rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lb-orange rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(g.avgValeria / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-lb-surface rounded-lg p-5 md:p-6 md:col-span-2">
        <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Against the Critics</h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <CriticList title="We liked it more than Letterboxd" items={criticGap.above} />
          <CriticList title="We liked it less than Letterboxd" items={criticGap.below} />
        </div>
      </div>
    </div>
  );
}
