const fallback = {
  label: "AA Progress",
  program: "Business Administration",
  completedCredits: 31,
  totalCredits: 60,
  remainingCredits: 29,
  percent: 52
};

function getNumber(value, fallbackValue) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallbackValue;
}

function updateProgress(data = fallback) {
  const label = data.label || fallback.label;
  const program = data.program || fallback.program;
  const completed = Math.max(0, getNumber(data.completedCredits, fallback.completedCredits));
  const total = Math.max(1, getNumber(data.totalCredits, fallback.totalCredits));
  const remaining = Math.max(getNumber(data.remainingCredits, total - completed), 0);
  const percent = Math.max(0, Math.min(100, getNumber(data.percent, Math.round((completed / total) * 100))));

  document.getElementById("labelText").textContent = label;
  document.getElementById("programTitle").textContent = program;
  document.getElementById("percentTop").textContent = `${Math.round(percent)}%`;
  document.getElementById("creditLine").textContent = `${completed} of ${total} credits completed`;
  document.getElementById("remainingLine").textContent = `${remaining} remaining`;
  document.getElementById("completedValue").textContent = completed;
  document.getElementById("remainingValue").textContent = remaining;
  document.getElementById("totalValue").textContent = total;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(Math.round(percent)));
}

function loadCoverImage() {
  const card = document.querySelector(".degree-card");
  const cover = document.getElementById("cover");
  const image = document.getElementById("coverImage");
  const src = card.dataset.coverSrc;

  if (!src) {
    return;
  }

  const tester = new Image();

  tester.onload = () => {
    image.src = src;
    cover.classList.add("has-image");
  };

  tester.onerror = () => {
    image.removeAttribute("src");
    cover.classList.remove("has-image");
  };

  tester.src = src;
}

async function loadLiveProgress() {
  updateProgress(fallback);

  try {
    const response = await fetch("/.netlify/functions/progress", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    updateProgress({
      label: data.label || fallback.label,
      program: data.program || fallback.program,
      completedCredits: data.completedCredits,
      totalCredits: data.totalCredits,
      remainingCredits: data.remainingCredits,
      percent: data.percent
    });
  } catch (error) {
    console.info("Using fallback AA progress data.");
  }
}

loadCoverImage();
loadLiveProgress();
