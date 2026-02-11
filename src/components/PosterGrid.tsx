import { Movie } from "@/lib/filmUtils";

interface PosterGridProps {
  title: string;
  movies: Movie[];
}

export default function PosterGrid({ title, movies }: PosterGridProps) {
  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {movies.map((movie) => (
          <a
            key={movie.id}
            href={movie.Film_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[2/3] rounded overflow-hidden bg-lb-bar"
          >
            <img
              src={movie.Poster_Movie}
              alt={movie.Film_title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs font-medium text-lb-bright leading-tight line-clamp-2">
                  {movie.Film_title}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] text-lb-green">I: {movie.Rating_Igor}★</span>
                  <span className="text-[10px] text-lb-orange">V: {movie.Rating_Valeria}★</span>
                </div>
              </div>
            </div>
            {/* Green border on top-rated */}
            {(movie.Rating_Igor + movie.Rating_Valeria) / 2 >= 4.5 && (
              <div className="absolute inset-0 ring-2 ring-lb-green ring-inset rounded pointer-events-none" />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
