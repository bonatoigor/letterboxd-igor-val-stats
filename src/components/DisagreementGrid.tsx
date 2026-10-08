import { useState } from "react";
import { Movie } from "@/lib/filmUtils";
import MovieDetailModal from "./MovieDetailModal";

interface DisagreementGridProps {
  movies: Movie[];
}

export default function DisagreementGrid({ movies }: DisagreementGridProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Biggest Disagreements</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {movies.map((movie) => {
          const diff = Math.abs(movie.Rating_Igor - movie.Rating_Valeria);
          return (
            <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="cursor-pointer group">
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-lb-bar">
                <img
                  src={movie.Poster_Movie}
                  alt={movie.Film_title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-1 right-1 bg-black/75 text-lb-bright text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums">
                  Δ {diff.toFixed(1)}
                </span>
              </div>
              <p className="text-[11px] text-lb-bright font-medium leading-tight line-clamp-1 mt-1.5">{movie.Film_title}</p>
              <div className="flex justify-between text-[10px] sm:text-xs font-bold tabular-nums">
                <span className="text-lb-green">I: {movie.Rating_Igor}★</span>
                <span className="text-lb-orange">V: {movie.Rating_Valeria}★</span>
              </div>
            </div>
          );
        })}
      </div>

      <MovieDetailModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </section>
  );
}
