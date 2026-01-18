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

  function startCountdown() {
    let c = 3;
    countdown.textContent = c;

    const timer = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(timer);
        countdown.textContent = "";
        nextTrial();
      } else {
        countdown.textContent = c;
      }
    }, 1000);
  }

  function nextTrial() {
    canClick = false;
    box.style.display = "none";
    feedback.textContent = "";
    promptText.textContent = "";

    setTimeout(() => {
      spawnBox();
      startTime = Date.now();
    }, Math.random() * 1500 + 1000);
  }

  function spawnBox() {
    box.style.display = "block";
    const mode = tests[testIndex];

    if (mode === "center") {
      box.style.left = "50%";
      box.style.top = "50%";
      box.style.transform = "translate(-50%, -50%)";
      box.style.background = "green";
      shouldClick = true;
      canClick = true;
    }

    if (mode === "random") {
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
      box.style.background = "green";
      shouldClick = true;
      canClick = true;
    }

    if (mode === "color") {
      box.style.left = Math.random() * (innerWidth - 120) + "px";
      box.style.top = Math.random() * (innerHeight - 120) + "px";
      const color = colors[Math.floor(Math.random() * colors.length)];
      box.style.background = color;
      shouldClick = Math.random() > 0.5;
      promptText.textContent = shouldClick ? "CLICK" : "DON'T CLICK";

      if (!shouldClick) {
        canClick = false;
        setTimeout(() => {
          feedback.textContent = "Correct!";
          correctTrials++;
          nextTrial();
        }, 1500);
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
      nextTrial();
      return;
    }

    const time = Date.now() - startTime;
    results.push({ device: deviceName, test: tests[testIndex], trial: trial + 1, time });
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
        feedback.textContent = "Experiment complete";
        return;
      }
      startCountdown();
    } else {
      nextTrial();
    }
  }

  downloadBtn.onclick = () => {
    if (!results.length) return alert("No data");

    let csv = "Device,Test,Trial,Reaction Time (ms)\n";
    results.forEach(r => {
      csv += `${r.device},${r.test},${r.trial},${r.time}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const openSheets = confirm(
      "OK = Open in Google Sheets\nCancel = Download CSV"
    );

    if (openSheets) {
      window.open(
        "https://docs.google.com/spreadsheets/d/1/create?usp=csv&csvurl=" +
          encodeURIComponent(url),
        "_blank"
      );
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = "reaction_times.csv";
      a.click();
    }

    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
});
