const root = document.querySelector(".widget");
const fill = document.getElementById("fill");
const credits = document.getElementById("credits");
const percent = document.getElementById("percent");
const track = document.querySelector(".track");

const FALLBACK_PROGRESS = {
  earnedCredits: 31,
  totalCredits: 60,
  percent: 52,
  isFallback: true
};

function setProgress(data) {
  const value = Math.max(0, Math.min(100, Number(data.percent) || 0));
  fill.style.width = `${value}%`;
  track.setAttribute("aria-valuenow", String(Math.round(value)));
  credits.textContent = `${data.earnedCredits}/${data.totalCredits} credits`;
  percent.textContent = `${Math.round(value)}% complete`;
}

function setError(message) {
  console.warn("AA progress widget using fallback data:", message);
  setProgress(FALLBACK_PROGRESS);
}

async function loadProgress() {
  try {
    const apiUrl = window.location.protocol === "file:" || window.location.hostname.endsWith("github.io")
      ? null
      : "/api/progress";

    if (!apiUrl) {
      setProgress(FALLBACK_PROGRESS);
      return;
    }

    const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Progress unavailable");
      return;
    }

    setProgress(data);
  } catch {
    setError("Progress unavailable");
  }
}

loadProgress();
setInterval(loadProgress, 5 * 60 * 1000);
