import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FILE_PATH = "src/data/watch_next_excluded.json";
const SLUG_RE = /^[a-z0-9-]{1,200}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Appends film slugs to the Watch Next exclusion list in the repo (same GitHub flow as trigger-film-update).
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { slugs } = await req.json();
    if (!Array.isArray(slugs) || slugs.length === 0 || !slugs.every((s) => typeof s === "string" && SLUG_RE.test(s))) {
      return json({ error: "A lista 'slugs' é obrigatória." }, 400);
    }

    const GITHUB_PAT = Deno.env.get("GITHUB_PAT");
    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
    if (!GITHUB_PAT || !GITHUB_REPO) throw new Error("GitHub configuration missing");

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(url, { headers: { Authorization: `Bearer ${GITHUB_PAT}` } });

    let current: string[] = [];
    let sha: string | undefined;
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
      current = JSON.parse(atob(file.content.replace(/\s/g, "")));
    }

    const added = slugs.filter((s: string) => !current.includes(s));
    if (added.length === 0) return json({ success: true, added: 0 });

    const content = btoa(JSON.stringify([...current, ...added], null, 2) + "\n");
    const putRes = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_PAT}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Watch Next: exclude ${added.join(", ")}`, content, sha }),
    });
    if (!putRes.ok) throw new Error(await putRes.text());

    return json({ success: true, added: added.length });
  } catch (error: any) {
    console.error("Erro na Function:", error.message);
    return json({ error: error.message }, 500);
  }
});
