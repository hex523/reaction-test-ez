document.addEventListener("DOMContentLoaded", () => {
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
  let deviceName = "";
  let totalTrials = 0;
  let correctTrials = 0;

  const tests = ["center", "random", "color"];
  const colors = ["red", "orange", "yellow", "green", "blue"];

  // Device selection
  document.querySelectorAll(".deviceBtn").forEach(btn => {
    btn.onclick = () => {
      deviceName = btn.dataset.device;
      deviceSelect.style.display = "none";
      startBtn.style.display = "inline-block";
    };
  });

  startBtn.onclick = () => {
    startBtn.style.display = "none";
    startCountdown();
  };

  // Smooth countdown
  function startCountdown() {
    let c = 3;

    function showCountdown(num) {
      if (num <= 0) {
        countdown.textContent = "";
        nextTrial();
        return;
      }
      countdown.textContent = num;
      countdown.classList.add("show");
      setTimeout(() => countdown.classList.remove("show"), 500);
    }

    showCountdown(c);
    const timer = setInterval(() => {
      c--;
      showCountdown(c);
      if (c <= 0) clearInterval(timer);
    }, 1000);
  }

  function nextTrial() {
    canClick = false;
    hideBox();
    promptText.textContent = "";
    feedback.textContent = "";

    setTimeout(() => {
      spawnBox();
      startTime = Date.now();
    }, Math.random() * 1500 + 1000);
  }

  function hideBox() {
    box.classList.remove("show");
    setTimeout(() => box.style.display = "none", 400);
  }

  function getTestName(testCode) {
    switch (testCode) {
      case "center": return "Center Reaction";
      case "random": return "Random Position";
      case "color": return "Color Recognition";
      default: return testCode;
    }
  }

  function spawnBox() {
    box.style.display = "block";
    box.classList.add("show");

    const mode = tests[testIndex];

    // CENTER
    if (mode === "center") {
      box.style.left = "50%";
      box.style.top = "50%";
      box.style.transform = "translate(-50%, -50%) scale(1)";
      box.style.background = "green";
      shouldClick = true;
      canClick = true;
    }

    // RANDOM
    if (mode === "random") {
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
      box.style.background = "green";
      shouldClick = true;
      canClick = true;
    }

    // COLOR
    if (mode === "color") {
      box.style.left = Math.random() * (innerWidth - 120) + "px"; // random position
      box.style.top = Math.random() * (innerHeight - 120) + "px";
      const color = colors[Math.floor(Math.random() * colors.length)];
      box.style.background = color;
      shouldClick = Math.random() > 0.5;
      promptText.textContent = shouldClick ? "CLICK" : "DON'T CLICK";

      if (!shouldClick) {
        canClick = false;
        setTimeout(() => {
          feedback.textContent = "Good, you didn't click!";
          correctTrials++;
          hideBox();
          advance();
        }, 5000);
      } else {
        canClick = true;
      }
    }
  }

  box.onclick = () => {
    if (!canClick) return;

    totalTrials++;

    if (!shouldClick) {
      feedback.textContent = "Wrong!";
      hideBox();
      advance();
      return;
    }

    const time = Date.now() - startTime;
    results.push({
      device: deviceName,
      test: tests[testIndex],
      trial: trial + 1,
      time: time
    });
    feedback.textContent = `${time} ms`;
    correctTrials++;
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
    hideBox();
    feedback.textContent = "Experiment complete";

    const times = results.map(r => r.time);
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const best = times.length ? Math.min(...times) : 0;
    const worst = times.length ? Math.max(...times) : 0;
    const accuracy = totalTrials ? Math.round((correctTrials / totalTrials) * 100) : 100;

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

  // DOWNLOAD CSV
  downloadBtn.onclick = () => {
    if (!results.length) return alert("No data");

    let csv = "Device,Test,Trial,Reaction Time (ms)\n";
    results.forEach(r => {
      csv += `${r.device},${getTestName(r.test)},${r.trial},${r.time}\n`;
    });

    const times = results.map(r => r.time);
    const avg = times.length ? Math.round(times.reduce((a,b)=>a+b,0)/times.length) : 0;
    const best = times.length ? Math.min(...times) : 0;
    const worst = times.length ? Math.max(...times) : 0;
    const accuracy = totalTrials ? Math.round((correctTrials / totalTrials) * 100) : 100;

    csv += `\nAVERAGE,,,\t${avg}\n`;
    csv += `BEST (Fastest),,,\t${best}\n`;
    csv += `WORST (Slowest),,,\t${worst}\n`;
    csv += `ACCURACY,,,\t${accuracy}%\n`;

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

