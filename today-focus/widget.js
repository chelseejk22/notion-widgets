const ASSIGNMENTS_ENDPOINT = window.location.hostname.endsWith("netlify.app")
  ? "/.netlify/functions/today-focus"
  : "";

const ICONS = {
  header: "🌺",
  dueToday: "☀️",
  overdue: "🌊",
  upcoming: "🌴",
  nextStep: "✨"
};

const TYPE_ORDER = {
  exam: 0,
  quiz: 1,
  project: 2,
  homework: 3,
  discussion: 4,
  reading: 5,
  other: 6
};

const PRIORITY_ORDER = {
  high: 0,
  normal: 1,
  low: 2
};

const EFFORT_ORDER = {
  quick: 0,
  medium: 1,
  deep: 2
};

function getFallbackAssignments() {
  const today = getToday();
  const yesterday = addDays(today, -1);
  const daysUntilSunday = today.getDay() === 0 ? 0 : 7 - today.getDay();
  const nextUp = addDays(today, Math.min(1, daysUntilSunday));
  const laterThisWeek = addDays(today, Math.min(3, daysUntilSunday));

  return [
  {
    name: "Read Chapter 1 and notes",
    course: "ENG",
    dueDate: getDateKey(today),
    type: "Reading",
    priority: "Normal",
    effort: "Medium",
    completed: false
  },
  {
    name: "Discussion board intro reply",
    course: "PSYC",
    dueDate: getDateKey(today),
    type: "Discussion",
    priority: "High",
    effort: "Quick",
    completed: false
  },
  {
    name: "Syllabus quiz",
    course: "ENG",
    dueDate: getDateKey(yesterday),
    type: "Quiz",
    priority: "High",
    effort: "Quick",
    completed: false
  },
  {
    name: "Module 1 lecture notes",
    course: "PSYC",
    dueDate: getDateKey(nextUp),
    type: "Homework",
    priority: "Normal",
    effort: "Medium",
    completed: false
  },
  {
    name: "Week 1 check-in",
    course: "ENG",
    dueDate: getDateKey(laterThisWeek),
    type: "Other",
    priority: "Low",
    effort: "Quick",
    completed: false
  },
  {
    name: "Completed setup task",
    course: "PSYC",
    dueDate: getDateKey(today),
    type: "Other",
    priority: "Low",
    effort: "Quick",
    completed: true
  }
  ];
}

const emptyMessages = {
  dueToday: "Nothing due today",
  overdue: "No overdue work",
  upcoming: "Nothing else this week"
};

const elements = {
  focusTitle: document.getElementById("focusTitle"),
  dueTodayTitle: document.getElementById("dueTodayTitle"),
  overdueTitle: document.getElementById("overdueTitle"),
  upcomingTitle: document.getElementById("upcomingTitle"),
  nextStepTitle: document.getElementById("nextStepTitle"),
  todayDate: document.getElementById("todayDate"),
  dueTodayList: document.getElementById("dueTodayList"),
  overdueList: document.getElementById("overdueList"),
  upcomingList: document.getElementById("upcomingList"),
  dueTodayCount: document.getElementById("dueTodayCount"),
  overdueCount: document.getElementById("overdueCount"),
  upcomingCount: document.getElementById("upcomingCount"),
  nextStepText: document.getElementById("nextStepText"),
  itemTemplate: document.getElementById("assignmentItemTemplate")
};

function applyIcons() {
  elements.focusTitle.textContent = `${ICONS.header} Today’s Focus`;
  elements.dueTodayTitle.textContent = `${ICONS.dueToday} Due Today`;
  elements.overdueTitle.textContent = `${ICONS.overdue} Overdue`;
  elements.upcomingTitle.textContent = `${ICONS.upcoming} Upcoming This Week`;
  elements.nextStepTitle.textContent = `${ICONS.nextStep} Useful Next Step`;
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDueDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekRange(today) {
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = addDays(today, mondayOffset);
  const weekEnd = addDays(weekStart, 6);
  weekStart.setHours(0, 0, 0, 0);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

function formatFullDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatShortDueDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function normalizeAssignment(item) {
  return {
    name: String(item.name || "Untitled assignment").trim(),
    course: String(item.course || item.class || "").trim(),
    dueDate: item.dueDate || "",
    type: String(item.type || "").trim(),
    priority: String(item.priority || "").trim(),
    effort: String(item.effort || "").trim(),
    completed: item.completed === true
  };
}

function getRank(value, order, emptyRank, unknownRank = emptyRank) {
  const key = String(value || "").trim().toLowerCase();

  if (!key) {
    return emptyRank;
  }

  return Object.prototype.hasOwnProperty.call(order, key) ? order[key] : unknownRank;
}

function compareRanked(a, b, ranker) {
  return ranker(a) - ranker(b);
}

function compareDueDate(a, b) {
  return a.due.getTime() - b.due.getTime();
}

function compareName(a, b) {
  return a.name.localeCompare(b.name);
}

function priorityRank(assignment) {
  return getRank(assignment.priority, PRIORITY_ORDER, 3);
}

function typeRank(assignment) {
  return getRank(assignment.type, TYPE_ORDER, 7, TYPE_ORDER.other);
}

function effortRank(assignment) {
  return getRank(assignment.effort, EFFORT_ORDER, 3);
}

function sortDueToday(a, b) {
  return compareRanked(a, b, priorityRank)
    || compareRanked(a, b, typeRank)
    || compareRanked(a, b, effortRank)
    || compareName(a, b);
}

function sortOverdue(a, b) {
  return compareDueDate(a, b)
    || compareRanked(a, b, priorityRank)
    || compareName(a, b);
}

function sortUpcoming(a, b) {
  return compareDueDate(a, b)
    || compareRanked(a, b, priorityRank)
    || compareRanked(a, b, typeRank)
    || compareRanked(a, b, effortRank)
    || compareName(a, b);
}

function groupAssignments(assignments, today) {
  const { weekEnd } = getWeekRange(today);
  const todayKey = getDateKey(today);
  const dueToday = [];
  const overdue = [];
  const upcoming = [];

  assignments
    .map(normalizeAssignment)
    .filter((assignment) => !assignment.completed)
    .forEach((assignment) => {
      const due = parseLocalDueDate(assignment.dueDate);

      if (!due) {
        return;
      }

      const dueKey = getDateKey(due);
      const enriched = { ...assignment, due, dueKey };

      if (dueKey === todayKey) {
        dueToday.push(enriched);
      } else if (due < today) {
        overdue.push(enriched);
      } else if (due > today && due <= weekEnd) {
        upcoming.push(enriched);
      }
    });

  dueToday.sort(sortDueToday);
  overdue.sort(sortOverdue);
  upcoming.sort(sortUpcoming);

  return { dueToday, overdue, upcoming };
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function renderEmptyState(list, message) {
  const item = document.createElement("li");
  item.className = "empty-state";
  item.textContent = message;
  list.appendChild(item);
}

function renderAssignments(list, assignments, emptyMessage, options = {}) {
  clearElement(list);

  if (assignments.length === 0) {
    renderEmptyState(list, emptyMessage);
    return;
  }

  assignments.forEach((assignment) => {
    const item = elements.itemTemplate.content.firstElementChild.cloneNode(true);
    const courseLabel = item.querySelector(".course-label");
    const dueLabel = item.querySelector(".due-label");
    const nameLabel = item.querySelector(".assignment-name");

    courseLabel.textContent = assignment.course || "Class";
    dueLabel.textContent = options.showDueDate ? formatShortDueDate(assignment.due) : "";
    dueLabel.hidden = !options.showDueDate;
    nameLabel.textContent = assignment.name;
    list.appendChild(item);
  });
}

function chooseNextStep(groups) {
  if (groups.dueToday.length > 0) {
    return groups.dueToday[0];
  }

  if (groups.overdue.length > 0) {
    return groups.overdue[0];
  }

  if (groups.upcoming.length > 0) {
    return groups.upcoming[0];
  }

  return null;
}

function formatNextStep(assignment) {
  if (!assignment) {
    return "Nothing urgent this week. Do a quick D2L check.";
  }

  return `Finish ${assignment.name}`;
}

function render(assignments) {
  const today = getToday();
  const groups = groupAssignments(assignments, today);
  const nextStep = chooseNextStep(groups);

  elements.todayDate.textContent = formatFullDate(today);
  elements.todayDate.dateTime = getDateKey(today);

  elements.dueTodayCount.textContent = groups.dueToday.length;
  elements.overdueCount.textContent = groups.overdue.length;
  elements.upcomingCount.textContent = groups.upcoming.length;

  renderAssignments(elements.dueTodayList, groups.dueToday, emptyMessages.dueToday);
  renderAssignments(elements.overdueList, groups.overdue, emptyMessages.overdue, { showDueDate: true });
  renderAssignments(elements.upcomingList, groups.upcoming, emptyMessages.upcoming, { showDueDate: true });

  elements.nextStepText.textContent = formatNextStep(nextStep);
}

async function loadAssignments() {
  if (!ASSIGNMENTS_ENDPOINT) {
    console.info("Today Focus assignment source: mock");
    render(getFallbackAssignments());
    return;
  }

  try {
    const response = await fetch(ASSIGNMENTS_ENDPOINT, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error("Assignments endpoint unavailable.");
    }

    const data = await response.json();
    const isNotionSource = data.source === "notion" && Array.isArray(data.assignments);
    const assignments = isNotionSource ? data.assignments : getFallbackAssignments();
    const source = isNotionSource ? "notion" : "mock";
    const reason = typeof data.reason === "string" && data.reason ? ` (${data.reason})` : "";
    console.info(`Today Focus assignment source: ${source}${reason}`);
    render(assignments);
  } catch (error) {
    console.info("Today Focus assignment source: mock");
    render(getFallbackAssignments());
  }
}

applyIcons();
loadAssignments();
