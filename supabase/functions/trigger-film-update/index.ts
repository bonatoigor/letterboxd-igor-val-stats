import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { films } = body;

    if (!films || !Array.isArray(films)) {
      console.error("Erro: O corpo da requisição não contém o array 'films'.", body);
      return new Response(JSON.stringify({ error: "A lista 'films' é obrigatória." }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
    const FILE_PATH = "src/data/pending_films.json";

    if (!GITHUB_PAT || !GITHUB_REPO) throw new Error("GitHub configuration missing");

    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${GITHUB_PAT}` } });

    let currentContent = [];
    let sha = "";

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      const binary = atob(fileData.content.replace(/\s/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      currentContent = JSON.parse(new TextDecoder().decode(bytes));
    }

    // Adiciona os novos filmes à fila atual
    films.forEach((f: any) => {
      if (!currentContent.some((e: any) => e.slug === f.slug)) {
        currentContent.push({
          slug: f.slug.trim(),
          rating_i: Number(f.rating_i) || 0,
          rating_v: Number(f.rating_v) || 0,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const jsonString = JSON.stringify(currentContent, null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const base64Content = btoa(String.fromCharCode(...utf8Bytes));

    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_PAT}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Queue update: +${films.length} films`,
        content: base64Content,
        sha: sha,
      }),
    });

    if (!putRes.ok) throw new Error(await putRes.text());

    return new Response(JSON.stringify({ success: true, count: films.length }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("Erro na Function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
