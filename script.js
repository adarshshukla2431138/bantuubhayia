const names = ["Subhi","Bandariya","Gadhii","Kucchuoucchu","Kammoji","Mrs.Sharma","My Girl","Rasmalai","Memsahab"];

     function createName() {
  const name = document.createElement("div");
  name.classList.add("floating-text");
  name.innerText = names[Math.floor(Math.random() * names.length)];
  name.style.fontSize = (18 + Math.random() * 25) + "px";

  const directions = ["left-right", "right-left", "top-bottom", "bottom-top"];
  const direction = directions[Math.floor(Math.random() * directions.length)];
            
  if (direction === "left-right") {
    name.style.top = Math.random() * window.innerHeight + "px";
    name.style.animation = `floatLeftRight ${4 + Math.random() * 2}s linear forwards`;
  } else if (direction === "right-left") {
    name.style.top = Math.random() * window.innerHeight + "px";
    name.style.animation = `floatRightLeft ${4 + Math.random() * 2}s linear forwards`;
  } else if (direction === "top-bottom") {
    name.style.left = Math.random() * window.innerWidth + "px";
    name.style.animation = `floatTopBottom ${4 + Math.random() * 2}s linear forwards`;
  } else {
    name.style.left = Math.random() * window.innerWidth + "px";
    name.style.animation = `floatBottomTop ${4 + Math.random() * 2}s linear forwards`;
  }

  document.body.appendChild(name);
  setTimeout(() => name.remove(), 6000);
}

setInterval(createName, 700);

function blastThenPage2() {
  fireBlast();
  setTimeout(() => {
    document.getElementById("page1").classList.remove("active");
    document.getElementById("page2").classList.add("active");
    sunflowerLoop();
  }, 1300);
}

function fireBlast() {
  const maxWidth = Math.min(window.innerWidth, 600);  // limit spread on mobiles
  const maxHeight = Math.min(window.innerHeight, 600);

  for (let i = 0; i < 120; i++) {
    let blast = document.createElement("div");
    blast.className = "blast";
    blast.style.left = (window.innerWidth / 2) + "px";
    blast.style.top = (window.innerHeight / 2) + "px";

    let angle = Math.random() * 2 * Math.PI;
    let radius = Math.random() * Math.max(maxWidth, maxHeight);
    blast.style.setProperty("--x", Math.cos(angle) * radius + "px");
    blast.style.setProperty("--y", Math.sin(angle) * radius + "px");

    const colors = ["#ff4500","#ff6347","#ffd700","#ff8c00","#ffb347"];
    blast.style.background = colors[Math.floor(Math.random()*colors.length)];

    document.body.appendChild(blast);
    setTimeout(() => blast.remove(), 1200);
  }
}

function sunflowerLoop() {
  const maxLeft = Math.max(window.innerWidth - 50, 200); // avoid overflow
  setInterval(() => {
    const sun = document.createElement("div");
    sun.className = "sunflower";
    sun.innerText = "🌻";

    // sunflower never goes fully outside screen
    sun.style.left = Math.random() * maxLeft + "px";

    // smaller duration on mobiles
    sun.style.animationDuration = (window.innerWidth < 500 
                                   ? 2.5 + Math.random() * 1.5 
                                   : 3 + Math.random() * 2) + "s";

    document.getElementById("page2").appendChild(sun);
    setTimeout(() => sun.remove(), 7000);
  }, 600);
}

function checkAnswer(btn, selected) {
  const box = btn.closest(".box");
  const correct = box.dataset.answer;

  if (selected.toLowerCase() === correct.toLowerCase()) {
    // ✅ Correct Answer
    box.querySelector(".question").style.display = "none";
    box.querySelector("img").classList.add("show");

    // If all answers are correct → move to Page 3
    if (document.querySelectorAll('.box img.show').length === document.querySelectorAll('.box').length) {
      setTimeout(() => goToPage3(), 1200);
    }
  } else {
    // ❌ Wrong Answer
    btn.style.background = "gray";
    btn.disabled = true;

    // 🚨 Alert bar
    alert("Oops! Wrong Answer ❌ Try again!");
  }
}


function goToPage3() {
  document.getElementById("page2").classList.remove("active");
  document.getElementById("page3").classList.add("active");
  startKiss();
}

function startKiss() {
  const scene = document.getElementById("kissScene");
  scene.classList.remove("kiss");
  void scene.offsetWidth; // reset animation
  scene.classList.add("start");
  setTimeout(() => {
    scene.classList.add("kiss");
    createHearts();
  }, 2000);
}

function createHearts() {
  const scene = document.getElementById("kissScene");
  for (let i = 0; i < 7; i++) {
    let heart = document.createElement("div");
    heart.className = "heart";
    heart.innerText = "❤";
    heart.style.left = (50 + (Math.random()*100 - 50)) + "px";
    heart.style.bottom = "80px";
    heart.style.animationDuration = (1.8 + Math.random()*1.2) + "s";
    scene.appendChild(heart);
    setTimeout(() => heart.remove(), 2500);
  }
}

function replayKiss() { startKiss(); }
