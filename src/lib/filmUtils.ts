import filmsData from "@/data/films_stats.json";

export interface GeneralInfo {
  Total_Movies: number;
  Compatibility: number;
  Sum_Rating_Igor: number;
  Sum_Rating_Valeria: number;
  Avatar_Igor: string;
  Avatar_Valeria: string;
}

export interface Movie {
  id: number;
  Film_title: string;
  Poster_Movie: string;
  Release_year: number;
  Director: string;
  Cast: string[];
  Average_rating: number;
  Genres: string[];
  Themes: string[];
  Nanogenres: string[];
  Runtime: number;
  Countries: string[];
  Original_language: string;
  Spoken_languages: string[];
  Description: string;
  Studios: string[];
  Film_URL: string;
  Rating_Igor: number;
  Rating_Valeria: number;
}

export const getGeneralInfo = (): GeneralInfo => filmsData.General_Info[0] as GeneralInfo;
export const getMovies = (): Movie[] => filmsData.Movies_Info as Movie[];

export interface FrequencyItem {
  name: string;
  count: number;
  percentage: number;
}

export function getTopGenres(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    // Only use primary genres (short names, no descriptions)
    m.Genres.filter((g) => g.split(" ").length <= 3).forEach((g) => {
      freq[g] = (freq[g] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: (count / max) * 100,
  }));
}

export function getTopCountries(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    m.Countries.forEach((c) => {
      freq[c] = (freq[c] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: (count / max) * 100,
  }));
}

export interface RatedGenre {
  name: string;
  avgIgor: number;
  avgValeria: number;
}

export function getHighestRatedGenres(movies: Movie[], limit = 8): RatedGenre[] {
  const genreRatings: Record<string, { igorSum: number; valeriaSum: number; count: number }> = {};
  movies.forEach((m) => {
    m.Genres.filter((g) => g.split(" ").length <= 3).forEach((g) => {
      if (!genreRatings[g]) genreRatings[g] = { igorSum: 0, valeriaSum: 0, count: 0 };
      genreRatings[g].igorSum += m.Rating_Igor;
      genreRatings[g].valeriaSum += m.Rating_Valeria;
      genreRatings[g].count += 1;
    });
  });
  return Object.entries(genreRatings)
    .filter(([, v]) => v.count >= 5)
    .map(([name, v]) => ({
      name,
      avgIgor: v.igorSum / v.count,
      avgValeria: v.valeriaSum / v.count,
    }))
    .sort((a, b) => (b.avgIgor + b.avgValeria) / 2 - (a.avgIgor + a.avgValeria) / 2)
    .slice(0, limit);
}

export function getTopDirectors(movies: Movie[], limit = 8): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    freq[m.Director] = (freq[m.Director] || 0) + 1;
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([name, count]) => ({
    name,
    count,
    percentage: (count / max) * 100,
  }));
}

export function getHighestRatedMovies(movies: Movie[], limit = 12): Movie[] {
  return [...movies]
    .sort((a, b) => (b.Rating_Igor + b.Rating_Valeria) / 2 - (a.Rating_Igor + a.Rating_Valeria) / 2)
    .slice(0, limit);
}

export function getRecentMovies(movies: Movie[], limit = 12): Movie[] {
  return [...movies]
    .sort((a, b) => b.Release_year - a.Release_year || b.id - a.id)
    .slice(0, limit);
}

export function getDecadeDistribution(movies: Movie[]) {
  const decades: Record<string, number> = {};
  movies.forEach((m) => {
    const decade = `${Math.floor(m.Release_year / 10) * 10}s`;
    decades[decade] = (decades[decade] || 0) + 1;
  });
  return Object.entries(decades)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));
}
