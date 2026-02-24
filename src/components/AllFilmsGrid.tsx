import { useState } from "react";
import { Movie } from "@/lib/filmUtils";
import MovieDetailModal from "./MovieDetailModal";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface AllFilmsGridProps {
  movies: Movie[];
}

export default function AllFilmsGrid({ movies }: AllFilmsGridProps) {
  // Ordenar decrescente por ID
  const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleSeeMore = () => setVisibleCount(prev => prev + 12);

  return (
    <section className="bg-lb-surface rounded-lg p-5 md:p-6">
      <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">History (All Films)</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
        {sortedMovies.slice(0, visibleCount).map((movie) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovie(movie)}
            className="group relative aspect-[2/3] rounded overflow-hidden bg-lb-bar cursor-pointer"
          >
            <img
              src={movie.Poster_Movie}
              alt={movie.Film_title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
               <p className="text-[10px] font-bold text-lb-bright line-clamp-2 leading-tight">{movie.Film_title}</p>
               <div className="flex gap-2 mt-1">
                  <span className="text-[9px] text-lb-green">I: {movie.Rating_Igor}★</span>
                  <span className="text-[9px] text-lb-orange">V: {movie.Rating_Valeria}★</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < sortedMovies.length && (
        <div className="mt-8 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={handleSeeMore}
            className="text-lb-text hover:text-lb-bright gap-2 uppercase tracking-tighter text-xs"
          >
            <ChevronDown className="w-4 h-4" />
            See More ({sortedMovies.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      <MovieDetailModal 
        movie={selectedMovie} 
        isOpen={!!selectedMovie} 
        onClose={() => setSelectedMovie(null)} 
      />
    </section>
  );
}
