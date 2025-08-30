let startTime = 0,
  elapsed = 0,
  timerInterval,
  running = false;

const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const lapBtn = document.getElementById("lapBtn");
const saveBtn = document.getElementById("saveBtn");
const lapsDiv = document.getElementById("laps");
const savedTimesDiv = document.getElementById("savedTimes");
const darkModeToggle = document.getElementById("darkModeToggle");

function pad(num, length = 2) {
  return num.toString().padStart(length, "0");
}

function formatTime(ms) {
  let milliseconds = Math.floor(ms % 1000);
  let seconds = Math.floor((ms / 1000) % 60);
  let minutes = Math.floor((ms / (60 * 1000)) % 60);
  let hours = Math.floor(ms / (60 * 60 * 1000));
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

function updateDisplay() {
  let now = performance.now();
  let time = running ? elapsed + (now - startTime) : elapsed;
  display.textContent = formatTime(time);
}

function updateButtons() {
  startBtn.disabled = running;
  stopBtn.disabled = !running;
  resetBtn.disabled = !running && elapsed === 0;
  lapBtn.disabled = !running;
  saveBtn.disabled = running || elapsed === 0;
}

startBtn.onclick = () => {
  if (!running) {
    startTime = performance.now();
    timerInterval = setInterval(updateDisplay, 10);
    running = true;
    updateButtons();
  }
};

stopBtn.onclick = () => {
  if (running) {
    elapsed += performance.now() - startTime;
    clearInterval(timerInterval);
    running = false;
    updateDisplay();
    updateButtons();
  }
};

resetBtn.onclick = () => {
  if (running && !confirm("Stopwatch is running. Are you sure you want to reset?")) {
    return;
  }
  startTime = 0;
  elapsed = 0;
  clearInterval(timerInterval);
  running = false;
  lapsDiv.innerHTML = "";
  updateDisplay();
  updateButtons();
};

lapBtn.onclick = () => {
  if (running) {
    const lapTime = display.textContent;
    const lapElement = document.createElement("div");
    lapElement.textContent = `Lap: ${lapTime}`;
    lapsDiv.appendChild(lapElement);
  }
};

saveBtn.onclick = async () => {
  stopBtn.onclick();
  const timeString = display.textContent;

  // Save locally
  if (typeof Storage !== "undefined") {
    let times = JSON.parse(localStorage.getItem("stopwatchTimes") || "[]");
    times.push(timeString);
    localStorage.setItem("stopwatchTimes", JSON.stringify(times));
    displaySavedTimes(times);
  }

  // Save to backend if available (example API)
  try {
    const res = await fetch("/api/saveTime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time: timeString }),
    });
    if (res.ok) {
      loadSavedTimes();
    }
  } catch (err) {
    console.warn("Backend save failed, showing local saved times only.");
  }
  updateButtons();
};

function displaySavedTimes(times) {
  savedTimesDiv.innerHTML = times.map((t) => `<div>${t}</div>`).join("");
}

async function loadSavedTimes() {
  let localTimes = JSON.parse(localStorage.getItem("stopwatchTimes") || "[]");
  displaySavedTimes(localTimes);

  try {
    const res = await fetch("/api/getTimes");
    if (res.ok) {
      const times = await res.json();
      displaySavedTimes(times.map((obj) => obj.time));
    }
  } catch {
    // Fail silently and use local storage only
  }
}

window.onload = () => {
  updateButtons();
  loadSavedTimes();
};

// Dark mode toggle
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkModeToggle.checked);
});
