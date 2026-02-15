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
    if (!GITHUB_PAT) {
      throw new Error("GITHUB_PAT is not configured");
    }

    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");
    if (!GITHUB_REPO) {
      throw new Error("GITHUB_REPO is not configured");
    }

    const { slugs } = await req.json();
    if (!slugs || typeof slugs !== "string" || slugs.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "slugs is required (space-separated film slugs)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate slugs format (only alphanumeric, hyphens, spaces)
    const sanitized = slugs.trim();
    if (!/^[a-zA-Z0-9\- ]+$/.test(sanitized)) {
      return new Response(
        JSON.stringify({ error: "Invalid slug format. Use only letters, numbers, hyphens and spaces." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "update-film",
          client_payload: { slugs: sanitized },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API error [${response.status}]: ${text}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Workflow triggered successfully", slugs: sanitized }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error triggering GitHub workflow:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
