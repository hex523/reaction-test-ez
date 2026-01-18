document.addEventListener("DOMContentLoaded", () => {
  console.log("script loaded");

  const box = document.getElementById("box");
  const startBtn = document.getElementById("startBtn");
  const deviceSelect = document.getElementById("deviceSelect");
  const feedback = document.getElementById("feedback");
  const promptText = document.getElementById("prompt");
  const countdown = document.getElementById("countdown");
  const downloadBtn = document.getElementById("download");

  let testIndex = 0;
  let trial = 0;
  let startTime = 0;
  let canClick = false;
  let shouldClick = true;
  let results = [];

  const tests = ["center", "random", "color"];
  const colors = ["red", "orange", "yellow", "green", "blue"];

  document.querySelectorAll(".deviceBtn").forEach(btn => {
    btn.onclick = () => {
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

    const timer = setInterval(() => {
      c--;
      countdown.textContent = c > 0 ? c : "";
      if (c === 0) {
        clearInterval(timer);
        nextTrial();
      }
    }, 1000);
  }

  function nextTrial() {
    canClick = false;
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
    box.style.display = "block";
    box.classList.add("show");

    const mode = tests[testIndex];

    if (mode === "center") {
      box.style.left = "50%";
      box.style.top = "50%";
      box.style.transform = "translate(-50%, -50%) scale(1)";
      box.style.background = "green";
      shouldClick = true;
    }

    if (mode === "random") {
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
      box.style.background = "green";
      shouldClick = true;
    }

    if (mode === "color") {
      box.style.left = "50%";
      box.style.top = "50%";
      box.style.transform = "translate(-50%, -50%) scale(1)";
      const color = colors[Math.floor(Math.random() * colors.length)];
      box.style.background = color;
      shouldClick = Math.random() > 0.5;
      promptText.textContent = shouldClick ? "CLICK" : "DON'T CLICK";
    }
  }

  box.onclick = () => {
    if (!canClick) return;

    if (!shouldClick) {
      feedback.textContent = "Wrong!";
      advance();
      return;
    }

    const time = Date.now() - startTime;
    results.push(time);
    feedback.textContent = `${time} ms`;
    advance();
  };

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
    feedback.textContent = "Experiment complete";

    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    const name = prompt("Enter your name:");
    if (!name) return;

    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name, avg });
    leaderboard.sort((a, b) => a.avg - b.avg);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    renderLeaderboard();
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

  downloadBtn.onclick = () => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    if (!leaderboard.length) return alert("No data");

    let csv = "Name,Avg(ms)\n";
    leaderboard.forEach(e => csv += `${e.name},${e.avg}\n`);

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reaction_times.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  renderLeaderboard();
});
