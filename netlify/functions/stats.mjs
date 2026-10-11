// Vrací návštěvy pro stránku /stats/ – chráněno heslem z proměnné STATS_KEY.
import { getStore } from "@netlify/blobs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const secret = process.env.STATS_KEY;
  if (!secret) return json({ error: "Na Netlify chybí proměnná STATS_KEY." }, 503);
  if (req.headers.get("x-stats-key") !== secret) return json({ error: "Špatné heslo." }, 401);

  const url = new URL(req.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days"), 10) || 30, 1), 365);
  const store = getStore({ name: "baji-stats", consistency: "strong" });

  const prefixes = [];
  for (let i = 0; i < days; i++) {
    prefixes.push("visits/" + new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10) + "/");
  }

  const keys = (await Promise.all(prefixes.map((prefix) => store.list({ prefix }))))
    .flatMap((result) => result.blobs.map((blob) => blob.key));
  const views = (await Promise.all(keys.map((key) => store.get(key, { type: "json" })))).filter(Boolean);

  // Zobrazení stránek → návštěvy
  const sessions = new Map();
  for (const view of views.sort((a, b) => a.start.localeCompare(b.start))) {
    let visit = sessions.get(view.session);
    if (!visit) {
      const { path, duration, unlocked, start, last, session, sessionStart, ...info } = view;
      visit = { ...info, id: session, start: sessionStart, last, pages: {}, views: 0, duration: 0, unlocked: false };
      sessions.set(session, visit);
    }
    visit.pages[view.path] = (visit.pages[view.path] || 0) + view.duration;
    visit.views += 1;
    visit.duration += view.duration;
    visit.unlocked ||= view.unlocked;
    if (view.last > visit.last) visit.last = view.last;
  }

  const visits = [...sessions.values()].sort((a, b) => b.start.localeCompare(a.start));
  return json({ visits });
};

export const config = { path: "/api/stats" };
