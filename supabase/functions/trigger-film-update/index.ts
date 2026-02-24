import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
    const FILE_PATH = "src/data/pending_films.json";

    if (!GITHUB_PAT || !GITHUB_REPO) {
      throw new Error("GitHub configuration missing");
    }

    const { slug, rating_i, rating_v } = await req.json();

    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${GITHUB_PAT}` },
    });

    let currentContent = [];
    let sha = "";

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      const decoded = atob(fileData.content.replace(/\n/g, ""));
      currentContent = JSON.parse(decoded);
    }

    const newEntry = {
      slug: slug.trim(),
      rating_i: Number(rating_i) || 0,
      rating_v: Number(rating_v) || 0,
      timestamp: new Date().toISOString(),
    };
    
    if (!currentContent.some((f: any) => f.slug === newEntry.slug)) {
      currentContent.push(newEntry);
    }

    const updatedBody = {
      message: `Enfileirando filme: ${newEntry.slug}`,
      content: btoa(JSON.stringify(currentContent, null, 2)),
      sha: sha,
    };

    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBody),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      throw new Error(`Erro ao salvar no GitHub: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Filme adicionado à fila com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
