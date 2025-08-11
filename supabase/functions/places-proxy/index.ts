import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutocompleteBody {
  action: "autocomplete";
  input: string;
  sessiontoken?: string;
}

interface DetailsBody {
  action: "details";
  place_id: string;
  sessiontoken?: string;
}

interface ReverseGeocodeBody {
  action: "reverse_geocode";
  lat: number;
  lng: number;
}

interface HealthBody {
  action: "health";
}

type RequestBody = AutocompleteBody | DetailsBody | ReverseGeocodeBody | HealthBody;

function getPlacesKey() {
  const fromEnv = Deno.env.get("PLACES_API_KEY");
  const fallback = "AIzaSyA7sn0fs6f0vRDm3RIkRKn_R-haAgH4M0A"; // fallback for preview; set PLACES_API_KEY secret in Prod
  if (!fromEnv) {
    console.warn("[places-proxy] PLACES_API_KEY not set; using fallback key. Configure Supabase secret ASAP.");
  }
  return fromEnv || fallback;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstream error ${res.status}: ${text}`);
  }
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const key = getPlacesKey();

    let body: RequestBody | null = null;
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      // allow GET health checks without body
      const url = new URL(req.url);
      const action = url.searchParams.get("action");
      if (action === "health") {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!body || !("action" in body)) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (body.action === "health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (body.action === "autocomplete") {
      const { input, sessiontoken } = body as AutocompleteBody;
      if (!input) throw new Error("input is required");
      const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
      url.searchParams.set("key", key);
      url.searchParams.set("input", input);
      url.searchParams.set("components", "country:in");
      url.searchParams.set("types", "geocode");
      if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

      const data = await fetchJson(url.toString());
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      return new Response(
        JSON.stringify({ predictions, sessiontoken: sessiontoken }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (body.action === "details") {
      const { place_id, sessiontoken } = body as DetailsBody;
      if (!place_id) throw new Error("place_id is required");
      const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
      url.searchParams.set("key", key);
      url.searchParams.set("place_id", place_id);
      url.searchParams.set("fields", "formatted_address,geometry,place_id,name");
      if (sessiontoken) url.searchParams.set("sessiontoken", sessiontoken);

      const data = await fetchJson(url.toString());
      const r = data.result;
      const result = r
        ? {
            place_id: r.place_id,
            formatted_address: r.formatted_address,
            geometry: { location: { lat: r.geometry.location.lat, lng: r.geometry.location.lng } },
            name: r.name,
          }
        : null;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (body.action === "reverse_geocode") {
      const { lat, lng } = body as ReverseGeocodeBody;
      if (typeof lat !== "number" || typeof lng !== "number") throw new Error("lat/lng required");
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("latlng", `${lat},${lng}`);
      url.searchParams.set("key", key);

      const data = await fetchJson(url.toString());
      const first = Array.isArray(data.results) ? data.results[0] : null;
      const result = first ? { formatted_address: first.formatted_address, place_id: first.place_id } : null;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[places-proxy] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});