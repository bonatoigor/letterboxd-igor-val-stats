import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY not configured");

    const { films } = await req.json();
    // films = [{title, year, id}, ...]

    const results: Record<number, string> = {};

    for (const film of films) {
      try {
        const params = new URLSearchParams({ api_key: TMDB_API_KEY, query: film.title });
        if (film.year) params.set("year", String(film.year));

        const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
        if (!res.ok) continue;

        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Try to match by year first
          let match = data.results.find((r: any) => r.release_date?.startsWith(String(film.year)));
          if (!match) match = data.results[0];
          if (match.overview) {
            results[film.id] = match.overview;
          }
        }

        // Small delay to avoid TMDB rate limiting
        await new Promise(r => setTimeout(r, 250));
      } catch (e) {
        console.error(`Error fetching ${film.title}:`, e);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
