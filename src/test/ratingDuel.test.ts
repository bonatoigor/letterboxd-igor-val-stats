import { describe, it, expect } from "vitest";
import {
  Movie,
  getBiggestDisagreements,
  getGenreRatingsByPerson,
  getRatingDistribution,
  getRaterStats,
  getCriticGap,
  getRecommendations,
} from "@/lib/filmUtils";

const movie = (id: number, igor: number, valeria: number, avg: number, genres = ["Horror"]): Movie => ({
  id,
  Film_title: `Film ${id}`,
  Poster_Movie: "",
  Release_year: 2000,
  Director: "",
  Description: "",
  Cast: [],
  Average_rating: avg,
  Genres: genres,
  Themes: [],
  Nanogenres: [],
  Runtime: 100,
  Countries: [],
  Original_language: "",
  Spoken_languages: [],
  Studios: [],
  Film_URL: "",
  Rating_Igor: igor,
  Rating_Valeria: valeria,
});

const movies = [
  movie(1, 2, 4, 3),
  movie(2, 5, 3.5, 3.5, ["Comedy"]),
  movie(3, 4, 4, 2),
  movie(4, 0, 3, 3), // unrated by Igor, ignored
];

describe("Igor vs Valéria stats", () => {
  it("sorts disagreements by gap and skips ties and unrated films", () => {
    expect(getBiggestDisagreements(movies).map((m) => m.id)).toEqual([1, 2]);
  });

  it("computes per-person genre averages", () => {
    const [horror] = getGenreRatingsByPerson(movies, 8, 1).filter((g) => g.name === "Horror");
    expect(horror).toMatchObject({ count: 2, avgIgor: 3, avgValeria: 4 });
  });

  it("buckets ratings by half star", () => {
    const dist = getRatingDistribution(movies);
    expect(dist).toHaveLength(10);
    expect(dist.find((b) => b.rating === 4)).toEqual({ rating: 4, igor: 1, valeria: 2 });
  });

  it("computes averages and gap vs community", () => {
    const { igor, valeria } = getRaterStats(movies);
    expect(igor.avg).toBeCloseTo(11 / 3);
    expect(valeria.avg).toBeCloseTo(11.5 / 3);
    expect(igor.vsCommunity).toBeCloseTo((-1 + 1.5 + 2) / 3);
  });

  it("splits films above and below the Letterboxd average", () => {
    const { above, below } = getCriticGap(movies);
    expect(above.map((i) => i.movie.id)).toEqual([3, 2]);
    expect(below).toEqual([]);
  });
});

describe("getRecommendations", () => {
  const similar = (slug: string, poster: string | null = "p.jpg") => ({
    id: slug, slug, title: slug, year: 2000, url: `https://letterboxd.com/film/${slug}/`, poster,
  });
  const source = (id: number, igor: number, valeria: number, slugs: ReturnType<typeof similar>[]) => ({
    ...movie(id, igor, valeria, 3),
    Film_URL: `https://letterboxd.com/film/source-${id}/`,
    Similar_Films: slugs,
  });

  it("scores unwatched similars by the couple rating and skips watched, posterless and low-rated sources", () => {
    const recs = getRecommendations([
      source(1, 5, 5, [similar("a"), similar("b"), similar("source-2"), similar("no-poster", null)]),
      source(2, 4, 3, [similar("b")]),
      source(3, 2, 2, [similar("c")]),
    ]);
    expect(recs.map((r) => r.film.slug)).toEqual(["b", "a"]);
    expect(recs[0].score).toBe(8.5);
    expect(recs[0].because.map((m) => m.id)).toEqual([1, 2]);
  });
});
