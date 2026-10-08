// Přijímá záznamy z js/t.js. Každé zobrazení stránky má vlastní položku
// (visits/<den>/<návštěva>/<zobrazení>), aby se souběžné zápisy nepřepisovaly.
import { getStore } from "@netlify/blobs";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor/i;
const ID = /^[a-z0-9]{8,40}$/;
const MAX_DURATION = 6 * 60 * 60; // s

const text = (value, max) => String(value || "").slice(0, max);

function parseAgent(ua) {
  const device = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|iPhone|Android/i.test(ua) ? "mobil" : "počítač";
  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Linux/.test(ua) ? "Linux" : "?";
  const browser =
    /Instagram/.test(ua) ? "Instagram" :
    /FBAN|FBAV|FB_IAB/.test(ua) ? "Facebook / Messenger" :
    /WhatsApp/.test(ua) ? "WhatsApp" :
    /Edg\//.test(ua) ? "Edge" :
    /OPR\//.test(ua) ? "Opera" :
    /SamsungBrowser/.test(ua) ? "Samsung Internet" :
    /CriOS|Chrome\//.test(ua) ? "Chrome" :
    /FxiOS|Firefox\//.test(ua) ? "Firefox" :
    /Safari\//.test(ua) ? "Safari" : "?";
  return { device, os, browser };
}

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });

  const ua = req.headers.get("user-agent") || "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });

  let data;
  try { data = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400 }); }
  if (!data || !ID.test(data.s) || !ID.test(data.v) || !ID.test(data.pv)) {
    return new Response(null, { status: 400 });
  }

  const now = Date.now();
  let start = Number(data.t0);
  if (!Number.isFinite(start) || start > now + 60_000 || start < now - 2 * 86_400_000) start = now;

  const day = new Date(start).toISOString().slice(0, 10);
  const key = `visits/${day}/${data.s}/${data.pv}`;
  const store = getStore({ name: "baji-stats", consistency: "strong" });

  let view = await store.get(key, { type: "json" });
  if (!view) {
    const geo = context.geo || {};
    let ref = text(data.r, 300);
    try { if (ref && new URL(ref).host === new URL(req.url).host) ref = ""; } catch { ref = ""; }
    view = {
      session: data.s,
      visitor: data.v,
      sessionStart: new Date(start).toISOString(),
      start: new Date(now).toISOString(),
      path: text(data.p, 120) || "/",
      city: geo.city || "",
      region: geo.subdivision?.name || "",
      country: geo.country?.name || geo.country?.code || "",
      ref,
      lang: text(data.l, 20),
      screen: `${Number(data.w) || 0}×${Number(data.h) || 0}`,
      ...parseAgent(ua),
      duration: 0,
      unlocked: false,
    };
  }

  const seconds = Math.min(Math.max(Number(data.d) || 0, 0), MAX_DURATION);
  view.duration = Math.max(view.duration, seconds);
  view.last = new Date(now).toISOString();
  if (data.e === "unlock") view.unlocked = true;

  await store.setJSON(key, view);
  return new Response(null, { status: 204 });
};

export const config = { path: "/api/hit" };
