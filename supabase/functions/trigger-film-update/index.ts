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
    const { films } = await req.json();
    console.log(`Recebido lote de ${films?.length} filmes.`);
    
    if (!Array.isArray(films) || films.length === 0) {
      throw new Error("Nenhum filme enviado.");
    }
    
    const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
    const FILE_PATH = "src/data/pending_films.json";

    if (!GITHUB_PAT || !GITHUB_REPO) {
      console.error("Erro: Secrets GITHUB_PAT ou GITHUB_REPO não configuradas.");
      throw new Error("GitHub configuration missing");
    }

    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    console.log("Buscando arquivo atual no GitHub...");
    const getRes = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${GITHUB_PAT}` },
    });

    let currentContent = [];
    let sha = "";

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      console.log("Arquivo encontrado. Decodificando conteúdo...");
      if (fileData.content) {
        const cleanedContent = fileData.content.replace(/\s/g, "");
        const decoded = new TextDecoder().decode(
          Uint8Array.from(atob(cleanedContent), (c) => c.charCodeAt(0))
        );
        currentContent = JSON.parse(decoded);
      }
    } else {
      console.log("Arquivo não existe ou está vazio. Criando nova fila.");
    }

    films.forEach((f: any) => {
      if (!currentContent.some((existing: any) => existing.slug === f.slug)) {
        currentContent.push({
          slug: f.slug.trim(),
          rating_i: Number(f.rating_i) || 0,
          rating_v: Number(f.rating_v) || 0,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 3. Codificação Segura para Base64 (UTF-8)
    console.log("Codificando nova fila para Base64...");
    const jsonString = JSON.stringify(currentContent, null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const base64Content = btoa(String.fromCharCode(...utf8Bytes));

    // 4. Salvar de volta no GitHub
    console.log("Enviando atualização para o GitHub...");
    const putRes = await fetch(getUrl, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${GITHUB_PAT}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        message: `Queue update: +${films.length} films`,
        content: base64Content,
        sha: sha, // Obrigatório para atualizar
      }),
    });

    if (!putRes.ok) {
      const errorText = await putRes.text();
      console.error("Erro na API do GitHub:", errorText);
      throw new Error(`Erro ao salvar no GitHub: ${errorText}`);
    }

    console.log("Sucesso! Fila atualizada.");
    return new Response(
      JSON.stringify({ success: true, message: "Filme adicionado à fila com sucesso!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erro Crítico na Function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
