import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const store = getStore({ name: "tactics-state", consistency: "strong" });

  if (req.method === "GET") {
    const state = (await store.get("state", { type: "json" })) || {};
    return new Response(JSON.stringify(state), {
      headers: { "content-type": "application/json" },
    });
  }

  if (req.method === "POST") {
    let body: { key?: unknown; checked?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid JSON body" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    if (typeof body.key !== "string" || !body.key) {
      return new Response(JSON.stringify({ error: "missing key" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const state = (await store.get("state", { type: "json" })) || {};
    state[body.key] = !!body.checked;
    await store.setJSON("state", state);

    return new Response(JSON.stringify(state), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/tactics-state",
};
