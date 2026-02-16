import ProfileHeader from "@/components/ProfileHeader";
import HorizontalBarChart from "@/components/HorizontalBarChart";
import RatedGenresChart from "@/components/RatedGenresChart";
import PosterGrid from "@/components/PosterGrid";
import DecadeChart from "@/components/DecadeChart";
import WorldMapChart from "@/components/WorldMapChart";
import MovieVibe from "@/components/MovieVibe";
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
  getTopSimilarFilms
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
const topThemes= getTopThemes(movies);
const topNanogenres = getTopNanogenres(movies);
const globalSumRating = getGlobalSumRating(movies);
const similarFilms = getTopSimilarFilms(movies);

const Index = () => {
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

        <div className="grid md:grid-cols-2 gap-6">
          <HorizontalBarChart title="Most Watched Genres" data={topGenres} color="green" />
          <HorizontalBarChart title="Most Watched Themes" data={topThemes} color="blue" />
          <HorizontalBarChart title="Most Watched Nanogenres" data={topNanogenres} color="green" />
          <HorizontalBarChart title="Most Watched Countries" data={topCountries} color="blue" />
          <RatedGenresChart data={ratedGenres} />
          <HorizontalBarChart title="Most Watched Directors" data={topDirectors} color="blue" />
          <HorizontalBarChart title="Most Watched Actors" data={topActors} color="green" />
          <HorizontalBarChart title="Most Watched Languages" data={topLanguages} color="blue" />
        </div>

        <WorldMapChart movies={movies} />

        <section className="bg-lb-surface rounded-lg p-5 md:p-6">
          <h3 className="text-sm uppercase tracking-widest text-lb-text mb-4 font-medium">Similar Films</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {similarFilms.map((film) => (
              <a
                key={film.id}
                href={film.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[2/3] rounded overflow-hidden bg-lb-bar"
                title={`${film.title} (${film.count}×)`}
              >
                <img
                  src={film.poster}
                  alt={film.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className="text-[10px] font-medium text-lb-bright leading-tight line-clamp-2">{film.title}</p>
                    <span className="text-[9px] text-lb-green">{film.count}× recommended</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <PosterGrid title="Highest Rated" movies={highestRated} />
        <PosterGrid title="Recent Films" movies={recent} />

        <MovieVibe keywords={getTopKeywords(movies)} />

        <footer className="text-center py-8 text-lb-text text-xs">
          <p>Igor & Valéria • Film Stats Dashboard</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
