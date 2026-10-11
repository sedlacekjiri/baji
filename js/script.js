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
    "Zkus to znovu.",
    "Skoro, ale ne úplně.",
    "Nápověda: plave, je hravá a miluje vodu.",
    "Pořád to není ono… zkus to napsat jinak.",
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
    setTimeout(() => { gate.remove(); }, 800);
  }

  function handleWrongAnswer() {
    gateError.textContent = wrongMessages[Math.min(attempts, wrongMessages.length - 1)];
    attempts++;
    gateCard.classList.remove("is-shaking");
    void gateCard.offsetWidth;
    gateCard.classList.add("is-shaking");
    gateInput.focus();
    gateInput.select();
  }

  gateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (normalize(gateInput.value) === CORRECT_ANSWER) {
      unlock(true);
    } else {
      handleWrongAnswer();
    }
  });

  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(STORAGE_KEY) === "1"; } catch (e) {}
  if (alreadyUnlocked) {
    unlock(false);
  } else {
    document.body.style.overflow = "hidden";
  }
})();
