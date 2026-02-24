import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Movie } from "@/lib/filmUtils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, Star, MapPin, Globe } from "lucide-react";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieDetailModal({ movie, isOpen, onClose }: MovieDetailModalProps) {
  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-lb-surface border-border/50 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster Lateral */}
            <div className="w-full md:w-1/3 shrink-0">
              <img 
                src={movie.Poster_Movie} 
                alt={movie.Film_title} 
                className="w-full rounded-lg shadow-2xl border border-white/10"
              />
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                  <span className="text-[10px] text-lb-text uppercase font-bold">Igor</span>
                  <span className="text-lb-green font-bold">{movie.Rating_Igor}★</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 p-2 rounded">
                  <span className="text-[10px] text-lb-text uppercase font-bold">Valéria</span>
                  <span className="text-lb-orange font-bold">{movie.Rating_Valeria}★</span>
                </div>
              </div>
            </div>

            {/* Informações Conteúdo */}
            <div className="flex-1 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl text-lb-bright leading-tight">
                  {movie.Film_title}
                </DialogTitle>
                <div className="flex flex-wrap gap-3 text-lb-text/70 text-sm mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {movie.Release_year}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {movie.Runtime} min</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {movie.Average_rating}</span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-lb-text font-bold mb-2">Synopsis</h4>
                  <p className="text-sm text-lb-text/90 leading-relaxed">{movie.Description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-lb-text font-bold mb-1">Director</h4>
                    <p className="text-sm text-lb-bright">{movie.Director}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-lb-text font-bold mb-1">Countries</h4>
                    <p className="text-sm text-lb-bright">{movie.Countries?.join(", ")}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-lb-text font-bold mb-2">Genres & Vibes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.Genres?.map(g => <Badge key={g} variant="outline" className="border-lb-green/30 text-lb-green text-[10px]">{g}</Badge>)}
                    {movie.Themes?.map(t => <Badge key={t} variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">{t}</Badge>)}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-lb-text font-bold mb-2">Cast</h4>
                  <p className="text-xs text-lb-text/70 line-clamp-2">{movie.Cast?.join(", ")}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
