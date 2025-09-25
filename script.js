// script.js — REPLACE YOUR OLD FILE ENTIRELY with this.
// Aggressive stability fixes while preserving all animations/effects.

"use strict";

/* ----------- Configuration & Environment ----------- */
const names = ["Subhi","Bandariya","Gadhii","Kucchuoucchu","Kammoji","Mrs.Sharma","My Girl","Rasmalai","Memsahab"];

// Detect mobile-ish environment (including "Request Desktop Site" cases)
const isTouchy = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
const isMobileUA = /Mobi|Android|iPhone|iPad|Phone/i.test(navigator.userAgent);
const IS_MOBILE = isTouchy || isMobileUA;

// Conservative caps (very low on phones)
const CAPS = {
  FLOATING_TEXT: IS_MOBILE ? 8  : 18,
  SUNFLOWERS:    IS_MOBILE ? 5  : 12,
  BLASTS:        IS_MOBILE ? 40 : 90,
  HEARTS:        IS_MOBILE ? 10 : 18
};

const INTERVALS = {
  NAME_MS: IS_MOBILE ? 1200 : 700,
  SUN_MS:  IS_MOBILE ? 900  : 600,
  BLAST_STAGGER_MS: IS_MOBILE ? 12 : 6
};

/* ----------- Internal handles ----------- */
let nameTimer = null;
let sunflowerTimer = null;
let sunflowerStarted = false;
let blastActive = false;
let lastFrame = performance.now();
let slowMode = false; // will throttle if frames are slow

/* ----------- Utility Helpers ----------- */
function clampToViewportLeft(x) {
  return Math.max(6, Math.min(x, Math.max(6, window.innerWidth - 60)));
}
function clampToViewportTop(y) {
  return Math.max(6, Math.min(y, Math.max(6, window.innerHeight - 60)));
}

function removeOld(selector, max) {
  const items = document.querySelectorAll(selector);
  if (items.length <= max) return;
  const removeCount = items.length - max;
  for (let i = 0; i < removeCount; i++) {
    try { items[i].remove(); } catch(e) {}
  }
}

/* ----------- Frame-health monitor (adaptive throttle) ----------- */
function monitorFrames() {
  const now = performance.now();
  const dt = now - lastFrame;
  lastFrame = now;
  // if frame time > 40ms (~<25fps), consider slow device & throttle
  slowMode = dt > 40;
  // run again later — low overhead
  requestAnimationFrame(monitorFrames);
}
requestAnimationFrame(monitorFrames);

/* ----------- Floating Names (Page 1) ----------- */
function createName() {
  const page1 = document.getElementById("page1");
  if (!page1 || !page1.classList.contains("active")) return;

  // cap check
  const existing = document.querySelectorAll(".floating-text").length;
  if (existing >= CAPS.FLOATING_TEXT) return;
  if (slowMode && existing >= Math.max(2, Math.floor(CAPS.FLOATING_TEXT/2))) return;

  const name = document.createElement("div");
  name.className = "floating-text";
  name.innerText = names[Math.floor(Math.random() * names.length)];
  name.style.fontSize = (16 + Math.random() * 18) + "px";

  const dir = ["left-right","right-left","top-bottom","bottom-top"][Math.floor(Math.random()*4)];
  if (dir === "left-right") {
    name.style.top = clampToViewportTop(Math.random() * window.innerHeight) + "px";
    name.style.animation = `floatLeftRight ${4 + Math.random()*2}s linear forwards`;
  } else if (dir === "right-left") {
    name.style.top = clampToViewportTop(Math.random() * window.innerHeight) + "px";
    name.style.animation = `floatRightLeft ${4 + Math.random()*2}s linear forwards`;
  } else if (dir === "top-bottom") {
    name.style.left = clampToViewportLeft(Math.random() * window.innerWidth) + "px";
    name.style.animation = `floatTopBottom ${4 + Math.random()*2}s linear forwards`;
  } else {
    name.style.left = clampToViewportLeft(Math.random() * window.innerWidth) + "px";
    name.style.animation = `floatBottomTop ${4 + Math.random()*2}s linear forwards`;
  }

  // append
  document.body.appendChild(name);

  // safe removal (slightly longer than animation to be safe)
  setTimeout(() => { try { name.remove(); } catch(e) {} }, 6400);

  // emergency cap cleanup
  removeOld(".floating-text", CAPS.FLOATING_TEXT);
}

function startFloatingNames() {
  if (nameTimer) return;
  createName();
  nameTimer = setInterval(() => {
    try { createName(); } catch(e) {}
  }, INTERVALS.NAME_MS * (slowMode ? 2 : 1));
}

function stopFloatingNames() {
  if (!nameTimer) return;
  clearInterval(nameTimer);
  nameTimer = null;
  removeOld(".floating-text", CAPS.FLOATING_TEXT);
}

/* ----------- Blast (transition Page1->Page2) ----------- */
function fireBlast() {
  if (blastActive) return;
  blastActive = true;

  const centerX = Math.round(window.innerWidth / 2);
  const centerY = Math.round(window.innerHeight / 2);
  const maxSpread = Math.max(Math.min(window.innerWidth, 900), Math.min(window.innerHeight, 900));
  const colors = ["#ff4500","#ff6347","#ffd700","#ff8c00","#ffb347"];

  const total = Math.min(CAPS.BLASTS, IS_MOBILE ? Math.floor(CAPS.BLASTS*0.55) : CAPS.BLASTS);
  const stagger = INTERVALS.BLAST_STAGGER_MS * (slowMode ? 2 : 1);
  let created = 0;

  // create using stagger with requestAnimationFrame batching
  function scheduleOne(idx) {
    setTimeout(() => {
      // small guard
      if (created >= total) return;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxSpread;
      const b = document.createElement("div");
      b.className = "blast";
      b.style.left = centerX + "px";
      b.style.top = centerY + "px";
      b.style.setProperty("--x", Math.cos(angle)*radius + "px");
      b.style.setProperty("--y", Math.sin(angle)*radius + "px");
      b.style.background = colors[Math.floor(Math.random()*colors.length)];
      document.body.appendChild(b);
      setTimeout(() => { try { b.remove(); } catch(e) {} }, 1400);
      created++;
      if (created >= total) blastActive = false;
    }, idx * stagger);
  }

  // schedule in small batches to avoid huge setTimeout flood
  const batch = 6;
  for (let i = 0; i < total; i++) {
    scheduleOne(i);
  }
}

/* ----------- Sunflowers (Page 2) ----------- */
function sunflowerLoop() {
  if (sunflowerStarted) return;
  sunflowerStarted = true;

  const container = document.getElementById("page2");
  sunflowerTimer = setInterval(() => {
    const page2 = document.getElementById("page2");
    if (!page2 || !page2.classList.contains("active")) return;

    const current = document.querySelectorAll(".sunflower").length;
    if (current >= CAPS.SUNFLOWERS) return;
    if (slowMode && current >= Math.max(1, Math.floor(CAPS.SUNFLOWERS/2))) return;

    // create
    const sun = document.createElement("div");
    sun.className = "sunflower";
    sun.innerText = "🌻";
    const maxLeft = Math.max(window.innerWidth - 50, 200);
    sun.style.left = (Math.random() * maxLeft) + "px";
    sun.style.animationDuration = (window.innerWidth < 500 ? 2.5 + Math.random()*1.5 : 3 + Math.random()*2) + "s";
    container.appendChild(sun);
    setTimeout(() => { try { sun.remove(); } catch(e) {} }, 7000);
    removeOld(".sunflower", CAPS.SUNFLOWERS);
  }, INTERVALS.SUN_MS * (slowMode ? 1.6 : 1));
}

function stopSunflowers() {
  sunflowerStarted = false;
  if (sunflowerTimer) {
    clearInterval(sunflowerTimer);
    sunflowerTimer = null;
  }
  removeOld(".sunflower", CAPS.SUNFLOWERS);
}

/* ----------- Quiz logic (keeps original behavior) ----------- */
function checkAnswer(btn, selected) {
  const box = btn.closest(".box");
  if (!box) return;
  const correct = box.dataset.answer;
  if (selected.toLowerCase() === correct.toLowerCase()) {
    const q = box.querySelector(".question");
    const img = box.querySelector("img");
    if (q) q.style.display = "none";
    if (img) img.classList.add("show");
    const totalBoxes = document.querySelectorAll('.box').length;
    const shown = document.querySelectorAll('.box img.show').length;
    if (shown === totalBoxes) setTimeout(() => goToPage3(), 1200);
  } else {
    btn.style.background = "gray";
    btn.disabled = true;
    alert("Oops! Wrong Answer ❌ Try again!");
  }
}

/* ----------- Page transitions ----------- */
function blastThenPage2() {
  fireBlast();
  setTimeout(() => {
    const p1 = document.getElementById("page1");
    const p2 = document.getElementById("page2");
    if (p1) p1.classList.remove("active");
    if (p2) p2.classList.add("active");
    stopFloatingNames();
    sunflowerLoop();
  }, 1300);
}

function goToPage3() {
  const p2 = document.getElementById("page2");
  const p3 = document.getElementById("page3");
  if (p2) p2.classList.remove("active");
  if (p3) p3.classList.add("active");
  stopSunflowers();
  startKiss();
}

/* ----------- Kiss / Hearts (Page 3) ----------- */
function startKiss() {
  const scene = document.getElementById("kissScene");
  if (!scene) return;
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
  const toCreate = Math.min(7, Math.max(0, CAPS.HEARTS - existing));
  for (let i = 0; i < toCreate; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.innerText = "❤";
      const offsetX = 50 + (Math.random()*100 - 50);
      heart.style.left = offsetX + "px";
      heart.style.bottom = "80px";
      heart.style.animationDuration = (1.8 + Math.random()*1.2) + "s";
      scene.appendChild(heart);
      setTimeout(() => { try { heart.remove(); } catch(e) {} }, 2600);
    }, i * (slowMode ? 140 : 80));
  }
}

function replayKiss() { startKiss(); }

/* ----------- Visibility, lifecycle & safety ----------- */
function pauseAll() {
  stopFloatingNames();
  stopSunflowers();
  // don't forcibly remove hearts/blasts in-flight; they auto-remove
}

function resumeForActive() {
  const p1 = document.getElementById("page1");
  const p2 = document.getElementById("page2");
  if (p1 && p1.classList.contains("active")) startFloatingNames();
  if (p2 && p2.classList.contains("active")) sunflowerLoop();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) pauseAll(); else resumeForActive();
});

window.addEventListener("resize", () => {
  // lightweight debounce
  clearTimeout(window.__resizeTimeout);
  window.__resizeTimeout = setTimeout(() => {
    // clean overshoot
    removeOld(".floating-text", CAPS.FLOATING_TEXT);
    removeOld(".sunflower", CAPS.SUNFLOWERS);
    // restart appropriate loops
    resumeForActive();
  }, 220);
});

window.addEventListener("load", () => {
  // start page1 names only if page1 active
  const p1 = document.getElementById("page1");
  if (p1 && p1.classList.contains("active")) startFloatingNames();
});

window.addEventListener("beforeunload", () => {
  stopFloatingNames();
  stopSunflowers();
});

/* Expose functions expected by inline html (keep original names) */
window.createName = createName;
window.blastThenPage2 = blastThenPage2;
window.fireBlast = fireBlast;
window.sunflowerLoop = sunflowerLoop;
window.checkAnswer = checkAnswer;
window.goToPage3 = goToPage3;
window.startKiss = startKiss;
window.createHearts = createHearts;
window.replayKiss = replayKiss;
