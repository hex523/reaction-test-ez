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
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
    }

    if (test.mode === "color") {
      box.style.background = colors[Math.floor(Math.random() * colors.length)];
      shouldClick = Math.random() > 0.5;
      promptText.textContent = shouldClick ? "CLICK" : "DON'T CLICK";

      if (!shouldClick) {
        noClickTimer = setTimeout(() => {
          feedback.textContent = "Correct (no click)";
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
      feedback.textContent = "Wrong click";
      advance();
      return;
    }

    const time = Date.now() - startTime;
    results.push({ time });
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
    feedback.textContent = "Experiment Complete";
    restartBtn.style.display = "block";

    if (!results.length) return;

    const name = prompt("Enter your name:");
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
    testIndex = 0;
    trial = 0;
    results = [];
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

  // 📊 DOWNLOAD CSV
  downloadBtn.addEventListener("click", () => {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    if (!leaderboard.length) {
      alert("No data to download");
      return;
    }

    let csv = "Name,Average Reaction Time (ms)\n";
    leaderboard.forEach(e => {
      csv += `${e.name},${e.avg}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reaction_times.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  renderLeaderboard();
});


  renderLeaderboard();
});

