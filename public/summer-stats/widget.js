const semesterConfig = {
  startDate: "2026-06-08",
  endDate: "2026-07-14",
  currentGpa: 4.0,
  credits: 6,
  classCount: 2
};

const MS_PER_DAY = 86_400_000;

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDayDiff(startDate, endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
}

function formatEndDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function pluralize(value, singular, plural = `${singular}s`) {
  return value === 1 ? singular : plural;
}

function getSemesterStats(config) {
  const startDate = parseLocalDate(config.startDate);
  const endDate = parseLocalDate(config.endDate);
  const today = getToday();
  const totalDays = Math.max(1, getDayDiff(startDate, endDate));
  const rawDaysComplete = getDayDiff(startDate, today);
  const rawDaysLeft = getDayDiff(today, endDate);
  const daysComplete = clamp(rawDaysComplete, 0, totalDays);
  const daysLeft = clamp(rawDaysLeft, 0, totalDays);
  const percent = clamp(Math.round((daysComplete / totalDays) * 100), 0, 100);

  return {
    totalDays,
    daysComplete,
    daysLeft,
    percent,
    endLabel: formatEndDate(endDate)
  };
}

function updateText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function renderStats(config = semesterConfig) {
  const stats = getSemesterStats(config);
  const progressTrack = document.querySelector(".progress-track");
  const progressFill = document.getElementById("progressFill");

  updateText("progressPercent", `${stats.percent}%`);
  updateText("daysCompleteFull", `${stats.daysComplete} / ${stats.totalDays} days complete`);
  updateText("daysCompleteShort", `${stats.daysComplete}/${stats.totalDays} days`);
  updateText("currentGpa", Number(config.currentGpa).toFixed(1));
  updateText("creditsEnrolled", String(config.credits));
  updateText("classCountFull", `${config.classCount} summer ${pluralize(config.classCount, "class", "classes")}`);
  updateText("classCountShort", `${config.classCount} ${pluralize(config.classCount, "class", "classes")}`);
  updateText("semesterEnd", stats.endLabel);
  updateText("daysLeft", `${stats.daysLeft} ${pluralize(stats.daysLeft, "day")} left`);

  if (progressFill) {
    progressFill.style.width = `${stats.percent}%`;
  }

  if (progressTrack) {
    progressTrack.setAttribute("aria-valuenow", String(stats.percent));
  }
}

renderStats();
