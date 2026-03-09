import { useState, useCallback } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import CastGrid from "@/components/CastGrid";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import RatedGenresChart from "@/components/RatedGenresChart";
import PosterGrid from "@/components/PosterGrid";
import DecadeChart from "@/components/DecadeChart";
import ByYearChart from "@/components/ByYearChart";
import WorldMapChart from "@/components/WorldMapChart";
import MovieVibe from "@/components/MovieVibe";
import { getFailedFilms } from "@/lib/filmUtils";
import DeveloperLogs from "@/components/DeveloperLogs";
import AllFilmsGrid from "@/components/AllFilmsGrid";
import FilmListModal from "@/components/FilmListModal";
import {
  getGeneralInfo,
  getMovies,
  getTopGenres,
  getTopCountries,
  getHighestRatedGenres,
  getTopDirectors,
  getHighestRatedMovies,
  getRecentMovies,
  getDecadeDistribution,
  getTotalHours,
  getTotalDays,
  getUniqueDirectorsCount,
  getUniqueCountriesCount,
  getUniqueLanguagesCount,
  getTopActors,
  getTopLanguages,
  getTopThemes,
  getTopNanogenres,
  getGlobalSumRating,
  getTopKeywords,
  Movie,
} from "@/lib/filmUtils";

const info = getGeneralInfo();
const movies = getMovies();
const topGenres = getTopGenres(movies);
const topCountries = getTopCountries(movies);
const ratedGenres = getHighestRatedGenres(movies);
const topDirectors = getTopDirectors(movies);
const highestRated = getHighestRatedMovies(movies);
const recent = getRecentMovies(movies);
const decades = getDecadeDistribution(movies);
const totalHours = getTotalHours(movies);
const totalDays = getTotalDays(movies);
const uniqueDirectors = getUniqueDirectorsCount(movies);
const uniqueCountries = getUniqueCountriesCount(movies);
const uniqueLanguages = getUniqueLanguagesCount(movies);
const topActors = getTopActors(movies);
const topLanguages = getTopLanguages(movies);
const topThemes = getTopThemes(movies);
const topNanogenres = getTopNanogenres(movies);
const globalSumRating = getGlobalSumRating(movies);
const failedFilms = getFailedFilms();

type FilterType = "Genres" | "Themes" | "Nanogenres" | "Countries" | "Director" | "Cast" | "Spoken_languages";

const filterMovies = (field: FilterType, value: string): Movie[] => {
  return movies.filter((m) => {
    if (field === "Director") return m.Director === value;
    const arr = m[field] as string[];
    return arr?.includes(value);
  });
};

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMovies, setModalMovies] = useState<Movie[]>([]);

  const handleCountClick = useCallback((field: FilterType) => (name: string) => {
    const filtered = filterMovies(field, name);
    setModalTitle(name);
    setModalMovies(filtered);
    setModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-lb-body">
      <ProfileHeader
        info={info}
        totalMovies={movies.length}
        totalHours={totalHours}
        totalDays={totalDays}
        globalSumRating={globalSumRating}
        uniqueDirectors={uniqueDirectors}
        uniqueCountries={uniqueCountries}
        uniqueLanguages={uniqueLanguages}
      />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
        <DecadeChart data={decades} />
        <ByYearChart movies={movies} />

        <div className="grid md:grid-cols-2 gap-6">
          <HorizontalBarChart title="Most Watched Genres" data={topGenres} color="green" onCountClick={handleCountClick("Genres")} />
          <HorizontalBarChart title="Most Watched Themes" data={topThemes} color="blue" onCountClick={handleCountClick("Themes")} />
          <HorizontalBarChart title="Most Watched Nanogenres" data={topNanogenres} color="green" onCountClick={handleCountClick("Nanogenres")} />
          <HorizontalBarChart title="Most Watched Countries" data={topCountries} color="blue" onCountClick={handleCountClick("Countries")} />
          <RatedGenresChart data={ratedGenres} />
          <HorizontalBarChart title="Most Watched Directors" data={topDirectors} color="blue" onCountClick={handleCountClick("Director")} />
          <HorizontalBarChart title="Most Watched Actors" data={topActors} color="green" onCountClick={handleCountClick("Cast")} />
          <HorizontalBarChart title="Most Watched Languages" data={topLanguages} color="blue" onCountClick={handleCountClick("Spoken_languages")} />
        </div>

        <WorldMapChart movies={movies} />
        
        <AllFilmsGrid movies={movies} />
        
        <PosterGrid title="Highest Rated" movies={highestRated} />
        <PosterGrid title="Recent Films" movies={recent} />

        <MovieVibe keywords={getTopKeywords(movies)} />

        <footer className="text-center py-8 text-lb-text text-xs">
          <p>Igor & Valéria • Film Stats Dashboard</p>
        </footer>
      </main>

      <DeveloperLogs films={failedFilms} />

      <FilmListModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={modalTitle}
        movies={modalMovies}
      />
    </div>
  );
};

export default Index;
