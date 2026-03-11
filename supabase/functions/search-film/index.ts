import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, year } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ error: "Film name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const query = year ? `${name} ${year}` : name;
    const searchUrl = `https://letterboxd.com/search/films/${encodeURIComponent(query)}/`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) throw new Error(`Letterboxd search failed: ${res.status}`);

    const html = await res.text();

    // Parse search results - each result has a data-film-slug or href pattern /film/slug/
    const results: { slug: string; title: string; year: string }[] = [];

    // Match film results: <span class="film-title-wrapper"><a href="/film/slug/">Title</a> <small>... <a href="/films/year/...">Year</a></small></span>
    const filmBlocks = html.match(/<li\s[^>]*class="[^"]*search-result[^"]*"[^>]*>[\s\S]*?<\/li>/gi) || [];

    for (const block of filmBlocks) {
      // Get the film link
      const filmLinkMatch = block.match(/href="\/film\/([^/]+)\/"/);
      if (!filmLinkMatch) continue;

      const slug = filmLinkMatch[1];

      // Get the title
      const titleMatch = block.match(/<span class="film-title-wrapper"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
      const title = titleMatch ? titleMatch[1].trim() : slug;

      // Get the year - look for the small tag with year link
      const yearMatch = block.match(/href="\/films\/year\/(\d{4})\/"/);
      const filmYear = yearMatch ? yearMatch[1] : "";

      results.push({ slug, title, year: filmYear });

      if (results.length >= 5) break;
    }

    // If year was provided, prioritize exact year match
    if (year && results.length > 0) {
      const exactMatch = results.find((r) => r.year === String(year));
      if (exactMatch) {
        return new Response(JSON.stringify({ results: [exactMatch, ...results.filter((r) => r !== exactMatch)] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Search error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
