const blobFill = document.getElementById("blobFill");
const sun = document.getElementById("sun");
const moon = document.getElementById("moon");
const lN = document.getElementById("lNight");
const lD = document.getElementById("lDay");
const wrap = document.getElementById("wrap");
const w1 = document.getElementById("w1");
const w2 = document.getElementById("w2");
const w3 = document.getElementById("w3");

const WAVE = [
  { night: "#1e3a5f", day: "#3aa0c4" },
  { night: "#2a4f78", day: "#6dc0d8" },
  { night: "#3a6490", day: "#a8dde8" }
];

const R = 68;
const BASE_SPEED = 0.00028;
const CLICK_SPEED = 0.018;
const DECAY = 0.994;

let angle = Math.PI;
let velocity = BASE_SPEED;
let lastTs = null;
let lastShadowIsDaytime = false;

const lerp = (a, b, t) => a + (b - a) * t;

function hexRgb(h) {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16)
  ];
}

function mixColor(h1, h2, t) {
  const [r1, g1, b1] = hexRgb(h1);
  const [r2, g2, b2] = hexRgb(h2);

  return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`;
}

function apply(a) {
  const cp = (1 + Math.cos(a)) / 2;

  document.body.style.background = mixColor("#f2edff", "#f5f4ee", cp);
  blobFill.style.background = mixColor("#7730ec", "#fcce18", cp);

  const sx = R * Math.sin(a);
  const sy = -R * Math.cos(a);

  sun.style.transform = `translate(${sx - 13}px, ${sy - 13}px)`;
  moon.style.transform = `translate(${-sx - 12}px, ${-sy - 12}px)`;

  const HORIZON = 20;
  const FADE = 22;

  sun.style.opacity = Math.max(0, Math.min(1, (HORIZON + FADE - sy) / FADE));
  moon.style.opacity = Math.max(0, Math.min(1, (HORIZON + FADE + sy) / FADE));

  lN.style.opacity = 1 - cp;
  lD.style.opacity = cp;

  w1.setAttribute("fill", mixColor(WAVE[0].night, WAVE[0].day, cp));
  w2.setAttribute("fill", mixColor(WAVE[1].night, WAVE[1].day, cp));
  w3.setAttribute("fill", mixColor(WAVE[2].night, WAVE[2].day, cp));

  const isDaytime = cp > 0.5;

  if (isDaytime !== lastShadowIsDaytime) {
    lastShadowIsDaytime = isDaytime;
    wrap.style.filter = isDaytime
      ? "drop-shadow(0 6px 28px rgba(252,206,24,0.42))"
      : "drop-shadow(0 6px 28px rgba(119,48,236,0.38))";
  }
}

function loop(ts) {
  if (lastTs !== null) {
    const dt = Math.min(ts - lastTs, 50);
    angle += velocity * dt;
    velocity = BASE_SPEED + (velocity - BASE_SPEED) * Math.pow(DECAY, dt);
    apply(angle);
  }

  lastTs = ts;
  requestAnimationFrame(loop);
}

function toggle() {
  velocity = CLICK_SPEED;
}

apply(Math.PI);
requestAnimationFrame(loop);
