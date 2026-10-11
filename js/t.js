// Vlastní malá analytika – posílá návštěvu, stránku a dobu strávenou na /api/hit.
(() => {
  "use strict";

  const ENDPOINT = "/api/hit";
  try { if (localStorage.getItem("bj_ignore") === "1") return; } catch (e) {}

  const rand = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  function stored(storage, key, make) {
    try {
      let value = storage.getItem(key);
      if (!value) { value = make(); storage.setItem(key, value); }
      return value;
    } catch (e) { return make(); }
  }

  const visitor = stored(localStorage, "bj_v", rand);
  const session = stored(sessionStorage, "bj_s", rand);
  const sessionStart = stored(sessionStorage, "bj_t0", () => String(Date.now()));
  const pageView = rand();

  // Měří se jen čas, kdy je stránka opravdu vidět.
  let activeMs = 0;
  let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
  const seconds = () => Math.round((activeMs + (visibleSince ? Date.now() - visibleSince : 0)) / 1000);

  function send(event, useBeacon) {
    const body = JSON.stringify({
      e: event,
      v: visitor,
      s: session,
      pv: pageView,
      t0: sessionStart,
      p: location.pathname,
      r: document.referrer,
      d: seconds(),
      w: screen.width,
      h: screen.height,
      l: navigator.language,
    });
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }));
    } else {
      fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (visibleSince) { activeMs += Date.now() - visibleSince; visibleSince = 0; }
      send("ping", true);
    } else {
      visibleSince = Date.now();
    }
  });
  window.addEventListener("pagehide", () => send("ping", true));
  setInterval(() => { if (visibleSince) send("ping"); }, 15000);

  window.bajiTrack = send;
  send("view");
})();
