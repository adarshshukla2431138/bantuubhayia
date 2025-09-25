// script.js — replace your old file with this.
// Purpose: keep all animations/effects but prevent mobile/desktop-site hangs
"use strict";

const names = ["Subhi","Bandariya","Gadhii","Kucchuoucchu","Kammoji","Mrs.Sharma","My Girl","Rasmalai","Memsahab"];

// Heuristics for mobile (covers "request desktop site" cases too)
const isMobileUA = /Mobi|Android|iPhone|iPad|Phone/i.test(navigator.userAgent);
const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
const isMobile = isMobileUA || hasTouch;

// Tunable caps (lower on phones)
const MAX_FLOATING_TEXT = isMobile ? 12 : 30;
const MAX_SUNFLOWERS = isMobile ? 8 : 20;
const MAX_TOTAL_BLASTS = isMobile ? 60 : 120;
const MAX_HEARTS = isMobile ? 12 : 30;

const NAME_INTERVAL_MS = isMobile ? 1000 : 700;
const SUNFLOWER_INTERVAL_MS = isMobile ? 900 : 600;

let nameInterval = null;
let sunflowerInterval = null;
let sunflowerStarted = false;
let blastInProgress = false;
let visibilityPaused = false;

// small helpers to keep positions inside viewport
function clampToViewportLeft(x) { return Math.max(8, Math.min(x, Math.max(8, window.innerWidth - 60))); }
function clampToViewportTop(y) { return Math.max(8, Math.min(y, Math.max(8, window.innerHeight - 60))); }

/* ------------------ FLOATING NAMES (Page 1) ------------------ */
function createName() {
  const page1 = document.getElementById("page1");
  if (!page1 || !page1.classList.contains("active")) return; // only while Page 1 active
  const existing = document.querySelectorAll(".floating-text");
  if (existing.length >= MAX_FLOATING_TEXT) return;

  const name = document.createElement("div");
  name.className = "floating-text";
  name.innerText = names[Math.floor(Math.random() * names.length)];
  name.style.fontSize = (18 + Math.random() * 25) + "px";

  const directions = ["left-right", "right-left", "top-bottom", "bottom-top"];
  const direction = directions[Math.floor(Math.random() * directions.length)];

  if (direction === "left-right") {
    name.style.top = clampToViewportTop(Math.random() * window.innerHeight) + "px";
    name.style.animation = `floatLeftRight ${4 + Math.random() * 2}s linear forwards`;
  } else if (direction === "right-left") {
    name.style.top = clampToViewportTop(Math.random() * window.innerHeight) + "px";
    name.style.animation = `floatRightLeft ${4 + Math.random() * 2}s linear forwards`;
  } else if (direction === "top-bottom") {
    name.style.left = clampToViewportLeft(Math.random() * window.innerWidth) + "px";
    name.style.animation = `floatTopBottom ${4 + Math.random() * 2}s linear forwards`;
  } else {
    name.style.left = clampToViewportLeft(Math.random() * window.innerWidth) + "px";
    name.style.animation = `floatBottomTop ${4 + Math.random() * 2}s linear forwards`;
  }

  document.body.appendChild(name);

  // Auto-remove after animation completes
  setTimeout(() => {
    try { name.remove(); } catch (e) {}
  }, 6200);

  // Extra safety: if somehow over limit, remove oldest
  const now = document.querySelectorAll(".floating-text");
  if (now.length > MAX_FLOATING_TEXT) {
    now[0].remove();
  }
}

function startFloatingNames() {
  if (nameInterval) return;
  // create one immediately and then interval
  createName();
  nameInterval = setInterval(createName, NAME_INTERVAL_MS);
}

function stopFloatingNames() {
  if (!nameInterval) return;
  clearInterval(nameInterval);
  nameInterval = null;
  // reduce extras if present
  const all = document.querySelectorAll(".floating-text");
  if (all.length > MAX_FLOATING_TEXT) {
    for (let i = 0; i < all.length - MAX_FLOATING_TEXT; i++) {
      try { all[i].remove(); } catch (e) {}
    }
  }
}

/* ------------------ BLAST (Page 1 -> Page 2 transition) ------------------ */
function fireBlast() {
  if (blastInProgress) return;
  blastInProgress = true;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const maxSpread = Math.max(Math.min(window.innerWidth, 900), Math.min(window.innerHeight, 900));
  const colors = ["#ff4500","#ff6347","#ffd700","#ff8c00","#ffb347"];

  const count = Math.min(MAX_TOTAL_BLASTS, isMobile ? Math.floor(MAX_TOTAL_BLASTS * 0.5) : MAX_TOTAL_BLASTS);
  const stagger = isMobile ? 10 : 6; // ms between each creation to avoid frame spike

  let created = 0;

  function createOne() {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * maxSpread;
    const blast = document.createElement("div");
    blast.className = "blast";
    blast.style.left = centerX + "px";
    blast.style.top = centerY + "px";
    blast.style.setProperty("--x", Math.cos(angle) * radius + "px");
    blast.style.setProperty("--y", Math.sin(angle) * radius + "px");
    blast.style.background = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(blast);
    setTimeout(() => { try { blast.remove(); } catch (e) {} }, 1400);

    created++;
    if (created >= count) {
      blastInProgress = false;
    }
  }

  // Stagger creation
  for (let i = 0; i < count; i++) {
    setTimeout(createOne, i * stagger);
  }
}

/* -------------- SUNFLOWERS (Page 2) -------------- */
function sunflowerLoop() {
  if (sunflowerStarted) return;
  sunflowerStarted = true;

  const container = document.getElementById("page2");
  sunflowerInterval = setInterval(() => {
    // only create while page2 active
    const page2 = document.getElementById("page2");
    if (!page2 || !page2.classList.contains("active")) return;

    const current = document.querySelectorAll(".sunflower").length;
    if (current >= MAX_SUNFLOWERS) return;

    const sun = document.createElement("div");
    sun.className = "sunflower";
    sun.innerText = "🌻";

    const maxLeft = Math.max(window.innerWidth - 50, 200);
    sun.style.left = (Math.random() * maxLeft) + "px";
    sun.style.animationDuration = (window.innerWidth < 500 ? 2.5 + Math.random() * 1.5 : 3 + Math.random() * 2) + "s";
    container.appendChild(sun);

    setTimeout(() => { try { sun.remove(); } catch (e) {} }, 7000);
  }, SUNFLOWER_INTERVAL_MS);
}

function stopSunflowers() {
  sunflowerStarted = false;
  if (sunflowerInterval) {
    clearInterval(sunflowerInterval);
    sunflowerInterval = null;
  }
  // clean extras if any
  const flowers = document.querySelectorAll(".sunflower");
  if (flowers.length > MAX_SUNFLOWERS) {
    for (let i = 0; i < flowers.length - MAX_SUNFLOWERS; i++) {
      try { flowers[i].remove(); } catch (e) {}
    }
  }
}

/* -------------- QUIZ / BOX BEHAVIOR -------------- */
function checkAnswer(btn, selected) {
  const box = btn.closest(".box");
  if (!box) return;
  const correct = box.dataset.answer;

  if (selected.toLowerCase() === correct.toLowerCase()) {
    // ✅ Correct Answer
    const q = box.querySelector(".question");
    const img = box.querySelector("img");
    if (q) q.style.display = "none";
    if (img) img.classList.add("show");

    // If all answers are correct → move to Page 3
    const totalBoxes = document.querySelectorAll('.box').length;
    const shown = document.querySelectorAll('.box img.show').length;
    if (shown === totalBoxes) {
      setTimeout(() => goToPage3(), 1200);
    }
  } else {
    // ❌ Wrong Answer
    btn.style.background = "gray";
    btn.disabled = true;
    alert("Oops! Wrong Answer ❌ Try again!");
  }
}

/* -------------- PAGE NAVIGATION -------------- */
function blastThenPage2() {
  // Trigger particle blast, then switch pages after a short delay
  fireBlast();
  setTimeout(() => {
    document.getElementById("page1").classList.remove("active");
    document.getElementById("page2").classList.add("active");

    // Stop Page1 names, start Page2 sunflowers (only while Page2 active)
    stopFloatingNames();
    sunflowerLoop();
  }, 1300);
}

function goToPage3() {
  document.getElementById("page2").classList.remove("active");
  document.getElementById("page3").classList.add("active");

  // stop heavy page2 effects immediately
  stopSunflowers();

  startKiss();
}

/* -------------- KISS / HEARTS (Page 3) -------------- */
function startKiss() {
  const scene = document.getElementById("kissScene");
  if (!scene) return;

  // reset classes to replay
  scene.classList.remove("kiss");
  void scene.offsetWidth;
  scene.classList.add("start");

  setTimeout(() => {
    scene.classList.add("kiss");
    createHearts();
  }, 2000);
}

function createHearts() {
  const scene = document.getElementById("kissScene");
  if (!scene) return;

  const existing = scene.querySelectorAll(".heart").length;
  const toCreate = Math.min(7, Math.max(0, MAX_HEARTS - existing)); // preserve original 7 but cap
  for (let i = 0; i < toCreate; i++) {
    // safety: small delay to spread DOM work
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.innerText = "❤";
      // place roughly in center area
      const offsetX = 50 + (Math.random() * 100 - 50);
      heart.style.left = offsetX + "px";
      heart.style.bottom = "80px";
      heart.style.animationDuration = (1.8 + Math.random() * 1.2) + "s";
      scene.appendChild(heart);
      setTimeout(() => { try { heart.remove(); } catch (e) {} }, 2600);
    }, i * 80);
  }
}

function replayKiss() {
  startKiss();
}

/* -------------- VISIBILITY & LIFECYCLE HANDLING -------------- */
function pauseAll() {
  visibilityPaused = true;
  stopFloatingNames();
  stopSunflowers();
  // don't forcibly clear hearts/blasts being removed; they auto-remove
}

function resumeForActivePage() {
  visibilityPaused = false;
  const p1 = document.getElementById("page1");
  const p2 = document.getElementById("page2");
  const p3 = document.getElementById("page3");

  if (p1 && p1.classList.contains("active")) startFloatingNames();
  if (p2 && p2.classList.contains("active")) sunflowerLoop();
  // page3 runs only on interactions (no continuous interval)
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseAll();
  } else {
    resumeForActivePage();
  }
});

// Ensure intervals respect active page on resize/orientationchange
let resizeTimeout = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // clean up any overflow floating stuff when viewport changes
    const texts = document.querySelectorAll(".floating-text");
    if (texts.length > MAX_FLOATING_TEXT) {
      for (let i = 0; i < texts.length - MAX_FLOATING_TEXT; i++) try { texts[i].remove(); } catch (e) {}
    }
    const flowers = document.querySelectorAll(".sunflower");
    if (flowers.length > MAX_SUNFLOWERS) {
      for (let i = 0; i < flowers.length - MAX_SUNFLOWERS; i++) try { flowers[i].remove(); } catch (e) {}
    }
    // if page1 is active but names aren't running, restart
    resumeForActivePage();
  }, 250);
});

// Ensure we start floating names only when appropriate (initial load)
window.addEventListener("load", () => {
  // Only start floating names if page1 initially active
  const p1 = document.getElementById("page1");
  if (p1 && p1.classList.contains("active")) {
    startFloatingNames();
  }
});

// Clean up on unload
window.addEventListener("beforeunload", () => {
  stopFloatingNames();
  stopSunflowers();
});
