import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toLetterboxdSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/['']/g, "")
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, year } = await req.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "Film name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY not configured");

    const params = new URLSearchParams({ api_key: TMDB_API_KEY, query: name });
    if (year) params.set("year", year);

    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
    if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);

    const data = await res.json();
    const results = (data.results || []).slice(0, 5).map((m: any) => {
      const title = m.title || "";
      const releaseYear = m.release_date ? m.release_date.split("-")[0] : "";
      const baseSlug = toLetterboxdSlug(title);
      return {
        slug: baseSlug,
        title,
        year: releaseYear,
        tmdb_id: m.id,
      };
    });

    // If multiple results share the same base slug, disambiguate with year
    const slugCounts: Record<string, number> = {};
    for (const r of results) {
      slugCounts[r.slug] = (slugCounts[r.slug] || 0) + 1;
    }
    for (const r of results) {
      if (slugCounts[r.slug] > 1 && r.year) {
        r.slug = `${r.slug}-${r.year}`;
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Search error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
