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
    site.hidden = false;
    document.body.style.overflow = "";
    if (remember) {
      try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
    }
    setTimeout(() => { gate.remove(); }, 700);
    initSiteInteractions();
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

  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
  if (alreadyUnlocked) {
    unlock(false);
  } else {
    document.body.style.overflow = "hidden";
  }

  function initSiteInteractions() {
    const nav = document.getElementById("nav");
    const navToggle = document.getElementById("nav-toggle");
    const navLinks = document.getElementById("nav-links");

    if (nav) {
      const onScroll = () => {
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
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
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }

    const video = document.getElementById("hero-video");
    if (video) {
      video.addEventListener("error", () => {
        video.style.display = "none";
      });
    }

    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
})();
