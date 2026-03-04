import { Movie } from "@/lib/filmUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilmListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  movies: Movie[];
}

export default function FilmListModal({ open, onOpenChange, title, movies }: FilmListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-lb-surface border-lb-border text-lb-bright max-w-md w-[95vw] sm:w-full p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
          <DialogTitle className="text-sm sm:text-base uppercase tracking-widest text-lb-text font-medium">
            {title}
          </DialogTitle>
          <p className="text-xs text-lb-text mt-1">{movies.length} films</p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] sm:max-h-[70vh]">
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-1">
            {movies
              .sort((a, b) => a.Film_title.localeCompare(b.Film_title))
              .map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between py-2 border-b border-lb-border/30 last:border-0 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={movie.Poster_Movie}
                      alt={movie.Film_title}
                      className="w-7 h-10 sm:w-8 sm:h-12 rounded object-cover shrink-0 bg-lb-bar"
                      loading="lazy"
                    />
                    <span className="text-sm sm:text-base text-lb-bright truncate font-medium">
                      {movie.Film_title}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-lb-text tabular-nums shrink-0">
                    {movie.Release_year}
                  </span>
                </div>
              ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
