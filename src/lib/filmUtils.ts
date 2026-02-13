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

export function getGlobalAverage(movies: Movie[]): string {
  if (movies.length === 0) return "0.0";
  const sum = movies.reduce((acc, m) => acc + (m.Average_rating || 0), 0);
  return (sum / movies.length).toFixed(1);
}

export function getGlobalSumRating(movies: Movie[]): string {
  const totalSum = movies.reduce((acc, m) => acc + (m.Average_rating || 0), 0);
  return totalSum.toFixed(2);
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

export function getTotalHours(movies: Movie[]): number {
  const totalMinutes = movies.reduce((sum, m) => sum + (m.Runtime || 0), 0);
  return totalMinutes / 60; 
}

export function getTotalDays(movies: Movie[]): number {
  return getTotalHours(movies) / 24;
}

export function getUniqueDirectorsCount(movies: Movie[]): number {
  return new Set(movies.map((m) => m.Director)).size;
}

export function getUniqueCountriesCount(movies: Movie[]): number {
  const countries = new Set<string>();
  movies.forEach((m) => m.Countries.forEach((c) => countries.add(c)));
  return countries.size;
}

export function getTopActors(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    m.Cast.forEach((actor) => {
      freq[actor] = (freq[actor] || 0) + 1;
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

export function getUniqueLanguagesCount(movies: Movie[]): number {
  const langs = new Set<string>();
  movies.forEach((m) => m.Spoken_languages?.forEach((l) => langs.add(l)));
  return langs.size;
}

export function getTopLanguages(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    m.Spoken_languages?.forEach((lang) => {
      freq[lang] = (freq[lang] || 0) + 1;
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

export function getTopThemes(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    m.Themes?.forEach((lang) => {
      freq[lang] = (freq[lang] || 0) + 1;
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

export function getTopNanogenres(movies: Movie[], limit = 10): FrequencyItem[] {
  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    m.Nanogenres?.forEach((lang) => {
      freq[lang] = (freq[lang] || 0) + 1;
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

export function getTopKeywords(movies: Movie[], limit = 25): { word: string; count: number }[] {
  const stopWords = new Set([
    "a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","must",
    "it","its","he","she","they","them","their","his","her","him","we","our","you","your","i","my","me","us",
    "this","that","these","those","who","which","what","where","when","how","why","if","then","than","so","as",
    "not","no","nor","up","out","about","into","over","after","before","between","under","again","further",
    "once","here","there","all","each","every","both","few","more","most","other","some","such","only","own",
    "same","too","very","just","also","now","new","one","two","three","find","finds","young",
    "world","story","film","movie","while","through","during","against","himself","herself","themselves",
    "whose","whom","get","gets","set","sets","back","way","around","take","takes","make","makes","goes","come",
    "becomes","begins","turns","must","however","yet","upon","among","across","along","within","without", "off",
    "tells", "shows", "following", "features", "includes", "including", "involved", 
    "living", "named", "called", "starts", "starting", "meets", "meeting", "becomes", 
    "became", "taken", "made", "seen", "gives", "given", "known", "years", "time", 
    "days", "everything", "something", "anything", "another", "others", "discovers", "soon",
    "together", "first", "last", "home", "place", "someone", "everyone", "looking",
    "de","le","la","les","un","une","des","et","en","du","que","qui","dans","par","pour","sur","au","aux",
    "se","ce","son","sa","ses","il","elle","ils","elles","est","sont","ne","pas","di","da","del","della"
  ]);

  const freq: Record<string, number> = {};
  movies.forEach((m) => {
    if (!m.Description) return;
    const words = m.Description.toLowerCase().replace(/[^a-záàâãéèêíïóôõúüç'-]/g, " ").split(/\s+/);
    words.forEach((w) => {
      const clean = w.replace(/^['-]+|['-]+$/g, "");
      if (clean.length > 2 && !stopWords.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
