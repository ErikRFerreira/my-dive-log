// supabase/functions/summarize-dive/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

type DivePayload = {
  location?: string | null;
  depth?: number | null;
  duration?: number | null;
  conditions?: string | null;
  notes?: string | null;
  date?: string | null;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json() as { dive?: DivePayload };
    const dive = body?.dive;

    if (!dive) {
      return new Response(
        JSON.stringify({ error: "Missing dive payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const location = dive.location || "an unknown site";
    const depth = dive.depth ?? 0;
    const duration = dive.duration ?? 0;
    const conditions = dive.conditions || "unspecified conditions";
    const notes = dive.notes || "no additional notes";
    const date = dive.date || "an unknown date";

    // 🔮 Fake “AI” summary built on the server
    const summary =
      `On ${date}, you dived at ${location} to a max depth of ${depth}m ` +
      `for ${duration} minutes in ${conditions}. Notes: ${notes}.`;

    return new Response(
      JSON.stringify({ summary }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in summarize-dive function:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
