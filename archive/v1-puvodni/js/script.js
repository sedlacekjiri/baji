(() => {
  "use strict";

  const CORRECT_ANSWER = "vydra";
  const STORAGE_KEY = "baji_unlocked";

  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gate-form");
  const gateInput = document.getElementById("gate-answer");
  const gateError = document.getElementById("gate-error");
  const gateCard = document.querySelector(".gate__card");
  const site = document.getElementById("site");

  const wrongMessages = [
    "Zkus to znovu 🤔",
    "Skoro, ale ne úplně 😄",
    "Nápověda: plave, je hravá a miluje vodu 🦦",
    "Pořád to není ono… zkus to jinak napsat 💭",
  ];
  let attempts = 0;

  function normalize(value) {
    return value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z]/gi, "")
      .toLowerCase();
  }

  function unlock(remember) {
    gate.classList.add("is-unlocked");
    if (window.bajiTrack) window.bajiTrack("unlock");
    site.hidden = false;
    document.body.style.overflow = "";
    if (remember) {
      try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    }
    setTimeout(() => { gate.remove(); }, 700);
    initSiteInteractions();
    if (heroVideo) keepPlaying(heroVideo);
    initHotPick();
  }

  function handleWrongAnswer() {
    const message = wrongMessages[Math.min(attempts, wrongMessages.length - 1)];
    gateError.textContent = message;
    attempts++;
    gateCard.classList.remove("is-shaking");
    void gateCard.offsetWidth;
    gateCard.classList.add("is-shaking");
    gateInput.focus();
    gateInput.select();
  }

  if (gateForm) {
    gateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = normalize(gateInput.value);
      if (value === CORRECT_ANSWER) {
        unlock(true);
      } else {
        handleWrongAnswer();
      }
    });
  }

  function hideOnLoadFailure(media) {
    const hide = () => { media.style.display = "none"; };
    media.addEventListener("error", hide);
    if (media.tagName === "IMG" && media.complete && media.naturalWidth === 0) {
      hide();
    } else if (media.tagName === "VIDEO" && media.error) {
      hide();
    }
  }

  // Autoplay can be blocked (e.g. iPhone Low Power Mode) – start the video
  // on the first touch/scroll/tap instead of waiting.
  // Smaller video on phones so it starts almost immediately.
  function pickSource(video) {
    const small = window.matchMedia("(max-width: 900px)").matches;
    const src = (small && video.dataset.srcMobile) || video.dataset.src;
    if (src && !video.getAttribute("src")) video.src = src;
  }

  function keepPlaying(video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const events = ["touchstart", "click", "scroll", "keydown"];
    const stopListening = () => {
      events.forEach((e) => window.removeEventListener(e, tryPlay));
    };
    function tryPlay() {
      if (!video.isConnected) return stopListening();
      const p = video.play();
      if (p && p.then) p.then(stopListening, () => {});
    }

    events.forEach((e) => window.addEventListener(e, tryPlay, { passive: true }));
    tryPlay();
    video.addEventListener("canplay", tryPlay, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && video.paused) tryPlay();
    });
  }

  let hotPickReady = false;
  function initHotPick() {
    const box = document.getElementById("hotpick");
    if (!box || hotPickReady) return;
    hotPickReady = true;
    // Accepts a bare track ID or a full open.spotify.com/track/... link
    const raw = (box.dataset.spotifyTrack || "").trim();
    const match = raw.match(/track[/:]([A-Za-z0-9]+)/);
    const trackId = match ? match[1] : raw;
    if (!/^[A-Za-z0-9]{10,}$/.test(trackId)) {
      box.hidden = true;
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.src = "https://open.spotify.com/embed/track/" + trackId + "?utm_source=generator&theme=0";
    iframe.title = "Hot Pick – Spotify";
    iframe.loading = "lazy";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    box.querySelector(".hotpick__player").appendChild(iframe);
  }

  const gateVideo = document.getElementById("gate-video");
  if (gateVideo) {
    pickSource(gateVideo);
    hideOnLoadFailure(gateVideo);
    keepPlaying(gateVideo);
  }

  const heroVideo = document.getElementById("hero-video");
  if (heroVideo) {
    pickSource(heroVideo);
    hideOnLoadFailure(heroVideo);
  }

  document.querySelectorAll(".gallery__media").forEach(hideOnLoadFailure);

  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
  if (alreadyUnlocked) {
    unlock(false);
  } else {
    document.body.style.overflow = "hidden";
  }

  function initSiteInteractions() {
    const nav = document.getElementById("nav");
    if (nav) {
      const onScroll = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
})();
