document.addEventListener("DOMContentLoaded", () => {

  const box = document.getElementById("box");
  const startBtn = document.getElementById("startBtn");
  const deviceSelect = document.getElementById("deviceSelect");
  const feedback = document.getElementById("feedback");
  const promptText = document.getElementById("prompt");
  const countdown = document.getElementById("countdown");
  const downloadBtn = document.getElementById("download");

  let device = "";
  let testIndex = 0;
  let trial = 0;
  let startTime = 0;
  let canClick = false;
  let shouldClick = false;
  let noClickTimer = null;

  let results = [];
  let correct = 0;
  let missed = 0;

  const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

  const tests = [
    { name: "Center Reaction", mode: "center" },
    { name: "Random Position", mode: "random" },
    { name: "Color Recognition", mode: "color" }
  ];

  const restartBtn = document.createElement("button");
  restartBtn.textContent = "🔄 Restart";
  restartBtn.style.position = "fixed";
  restartBtn.style.top = "15px";
  restartBtn.style.right = "15px";
  restartBtn.style.display = "none";
  document.body.appendChild(restartBtn);
  restartBtn.onclick = resetExperiment;

  document.querySelectorAll(".deviceBtn").forEach(btn => {
    btn.onclick = () => {
      device = btn.dataset.device;
      deviceSelect.style.display = "none";
      startBtn.style.display = "inline-block";
    };
  });

  startBtn.onclick = () => {
    startBtn.style.display = "none";
    startCountdown();
  };

  function startCountdown() {
    let c = 3;
    countdown.textContent = c;
    countdown.style.animation = "pulse 0.6s ease";

    const timer = setInterval(() => {
      c--;
      countdown.textContent = c > 0 ? c : "";
      countdown.style.animation = "none";
      countdown.offsetHeight;
      countdown.style.animation = "pulse 0.6s ease";

      if (c === 0) {
        clearInterval(timer);
        nextTrial();
      }
    }, 1000);
  }

  function nextTrial() {
    canClick = false;
    clearTimeout(noClickTimer);
    box.classList.remove("show");
    box.style.display = "none";
    promptText.textContent = "";
    feedback.textContent = "";

    setTimeout(() => {
      spawnBox();
      startTime = Date.now();
      canClick = true;
    }, Math.random() * 1500 + 1000);
  }

  function spawnBox() {
    const test = tests[testIndex];
    box.style.display = "block";
    box.classList.remove("show");
    requestAnimationFrame(() => box.classList.add("show"));

    if (test.mode === "center") {
      box.style.left = "50%";
      box.style.top = "50%";
      box.style.transform = "translate(-50%, -50%) scale(1)";
    } else {
      box.style.transform = "scale(1)";
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
    }

    if (test.mode === "color") {
      box.style.background = colors[Math.floor(Math.random() * colors.length)];
      shouldClick = Math.random() > 0.5;
      promptText.textContent = shouldClick ? "CLICK" : "DON'T CLICK";

      if (!shouldClick) {
        noClickTimer = setTimeout(() => {
          correct++;
          feedback.textContent = "Correct (no click)";
          animateFeedback();
          advance();
        }, 5000);
      }
    } else {
      box.style.background = "green";
      shouldClick = true;
    }
  }

  box.onclick = () => {
    if (!canClick) return;

    if (!shouldClick) {
      missed++;
      feedback.textContent = "Wrong click";
      animateFeedback();
      advance();
      return;
    }

    const time = Date.now() - startTime;
    correct++;
    results.push({ time });

    feedback.textContent = `${time} ms`;
    animateFeedback();
    advance();
  };

  function animateFeedback() {
    feedback.style.animation = "none";
    feedback.offsetHeight;
    feedback.style.animation = "pop 0.25s ease";
  }

  function advance() {
    trial++;
    if (trial >= 5) {
      trial = 0;
      testIndex++;
      if (testIndex >= tests.length) {
        endExperiment();
        return;
      }
      startCountdown();
    } else {
      nextTrial();
    }
  }

  function endExperiment() {
    box.style.display = "none";
    feedback.textContent = "Experiment Complete";
    restartBtn.style.display = "block";

    if (results.length === 0) return;

    const name = prompt("Enter your name for the leaderboard:");
    if (!name) return;

    const avg = Math.round(results.reduce((a, b) => a + b.time, 0) / results.length);
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

    leaderboard.push({ name: name.substring(0, 12), avg });
    leaderboard.sort((a, b) => a.avg - b.avg);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
  }

  function resetExperiment() {
    device = "";
    testIndex = 0;
    trial = 0;
    results = [];
    correct = 0;
    missed = 0;
    deviceSelect.style.display = "block";
    startBtn.style.display = "none";
    restartBtn.style.display = "none";
    feedback.textContent = "";
  }

  function renderLeaderboard() {
    const list = document.getElementById("leaderboardList");
    list.innerHTML = "";
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.forEach(e => {
      const li = document.createElement("li");
      li.textContent = `${e.name} – ${e.avg} ms`;
      list.appendChild(li);
    });
  }

  renderLeaderboard();
});