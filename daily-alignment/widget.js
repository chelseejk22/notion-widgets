const STORAGE_KEY = "chelseeDailyAlignmentVoice";
const DEFAULT_VOICE = "soft";

const dailyEntries = {
  soft: [
    {
      mood: "Calm focus, soft pace, one useful next step.",
      meaning:
        "Today supports a quieter kind of progress. Let Gemini sort the thoughts, let Pisces soften the pressure, and let the next step be small enough to actually begin.",
      chartThread:
        "Your Libra North Node points you back to beauty, balance, and support. You do not have to carry college, motherhood, and your future alone today.",
      leanInto: "A gentle routine that makes the next hour easier.",
      release: "Trying to fix the whole week in one sitting.",
      smallMove: "Reset one surface, one tab, or one assignment list.",
      anchor: "Peace counts as part of the plan."
    },
    {
      mood: "Tender structure with room to breathe.",
      meaning:
        "The day works best when your systems feel kind instead of tight. Choose the cleanest path through your student routine and let it be enough.",
      chartThread:
        "Gemini names the options, Pisces senses what feels heavy, and Libra asks for a graceful middle. Your future self needs support, not punishment.",
      leanInto: "A short list with only the essentials.",
      release: "Guilt about needing reminders or repeats.",
      smallMove: "Pick the one task that would make tonight lighter.",
      anchor: "Simple systems are a form of care."
    },
    {
      mood: "Soft discipline, steady heart, clear edges.",
      meaning:
        "Your attention may want to scatter, so give it a gentle container. A small boundary around time, noise, or clutter can make the whole day feel calmer.",
      chartThread:
        "Your Pisces Moon needs emotional room, while Gemini wants movement. Libra North Node says the win is a cleaner rhythm, not a harder push.",
      leanInto: "One timed focus block with a real stopping point.",
      release: "Saying yes before checking your capacity.",
      smallMove: "Set a timer for 20 minutes and begin anywhere.",
      anchor: "A boundary can be soft and still be real."
    },
    {
      mood: "Quiet confidence for the life you are building.",
      meaning:
        "Today asks for one mature choice that protects your energy. It may be unglamorous, but it moves you toward independence and a calmer home base.",
      chartThread:
        "Gemini helps you learn fast, Pisces keeps you connected to meaning, and Libra guides you toward choices that feel elegant and sustainable.",
      leanInto: "The task that supports money, school, or stability.",
      release: "Waiting for the perfect mood to begin.",
      smallMove: "Write down the next bill, deadline, or appointment.",
      anchor: "Future-you is built through gentle follow-through."
    },
    {
      mood: "Less noise, more inner steadiness.",
      meaning:
        "You do not need a dramatic reset. You need one calm pocket of order where your mind can land and your day can stop feeling so loud.",
      chartThread:
        "Your chart blends quick thoughts, deep feelings, and a path toward harmony. Let today be about making life easier to return to.",
      leanInto: "A soothing reset before the next responsibility.",
      release: "Overexplaining your pace to anyone.",
      smallMove: "Make water, keys, charger, and planner easy to find.",
      anchor: "Ease is productive when it keeps you steady."
    },
    {
      mood: "Warm clarity for a full life.",
      meaning:
        "Motherhood, school, money goals, and selfhood can all exist in the same day, but not all at the same volume. Let one priority lead at a time.",
      chartThread:
        "Gemini gives you range, Pisces gives you compassion, and Libra reminds you that balance is chosen in small moments, not found by accident.",
      leanInto: "Naming the season you are actually in.",
      release: "Comparing your rhythm to someone else's capacity.",
      smallMove: "Choose the top three, then cross one off if needed.",
      anchor: "You can move gently and still move forward."
    },
    {
      mood: "Graceful progress without self-pressure.",
      meaning:
        "The best move today is the one that makes tomorrow less chaotic. Think soft setup, clean notes, prepared bag, calmer morning.",
      chartThread:
        "Your Pisces Moon feels the atmosphere around you. Your Gemini Sun can refresh it quickly when the system is visible and easy to use.",
      leanInto: "Preparing your environment before expecting focus.",
      release: "All-or-nothing productivity.",
      smallMove: "Create one visible place for today's must-dos.",
      anchor: "A calm setup is a quiet advantage."
    }
  ],
  direct: [
    {
      mood: "Clear head, clean list, start small.",
      meaning:
        "Today is not asking for a personality change. It is asking for one practical action you can finish before your brain talks you out of it.",
      chartThread:
        "Gemini can see every option, Pisces can feel every emotion, and Libra needs you to choose the next fair, balanced step.",
      leanInto: "The task with the clearest finish line.",
      release: "Refreshing the plan instead of using it.",
      smallMove: "Open the assignment, bill, or list and do the first line.",
      anchor: "One done thing beats ten perfect intentions."
    },
    {
      mood: "Back on track without the spiral.",
      meaning:
        "If the day got messy, skip the shame and return to the system. You only need a restart point, not a whole new life plan.",
      chartThread:
        "Your Gemini Sun needs quick access, your Pisces Moon needs less overwhelm, and your Libra North Node needs fewer extremes.",
      leanInto: "A visible checklist with only today's items.",
      release: "Treating a late start like a failed day.",
      smallMove: "Write the next three actions in plain language.",
      anchor: "Restart fast, keep it simple."
    },
    {
      mood: "Focus where it actually pays off.",
      meaning:
        "Put your energy where it supports school, money, motherhood, or home stability. Anything else can wait its turn.",
      chartThread:
        "Gemini helps you gather information quickly. Libra asks you to spend that mental energy on the life you are intentionally building.",
      leanInto: "The decision that reduces future stress.",
      release: "Busywork that looks productive but changes nothing.",
      smallMove: "Handle one money, school, or calendar detail.",
      anchor: "Choose the move that buys back peace."
    },
    {
      mood: "Simple systems, no extra drama.",
      meaning:
        "The answer today is probably not more motivation. It is a cleaner setup, a shorter list, and fewer places for important things to hide.",
      chartThread:
        "Pisces Moon needs emotional calm, but Gemini Sun needs information close by. Put the important pieces where you can see them.",
      leanInto: "One home for notes, dates, and next steps.",
      release: "Keeping plans scattered across too many places.",
      smallMove: "Move one loose reminder into Notion or your planner.",
      anchor: "Make the system easier than avoidance."
    },
    {
      mood: "Firm, kind, and realistic.",
      meaning:
        "Do not make today's plan for an imaginary version of you. Make it for the real day, the real energy, and the real responsibilities in front of you.",
      chartThread:
        "Libra North Node brings you back to proportion. You can want an elevated life and still build it through small, repeatable choices.",
      leanInto: "A plan that respects your actual capacity.",
      release: "Overloading the day to prove you care.",
      smallMove: "Cut the list down to what truly matters.",
      anchor: "Realistic is more powerful than intense."
    },
    {
      mood: "Protect the priority.",
      meaning:
        "Pick the thing that matters and give it a protected pocket of time. You can be flexible without letting the whole day disappear.",
      chartThread:
        "Gemini gives you speed, Pisces gives you sensitivity, and Libra teaches clean boundaries around both.",
      leanInto: "A short focus block before the day gets louder.",
      release: "Letting every notification become the plan.",
      smallMove: "Put your phone across the room for one task.",
      anchor: "Attention is easier when the room supports it."
    },
    {
      mood: "Do less, finish more.",
      meaning:
        "Today rewards completion. Close a loop, send the message, submit the piece, clean the one area, or make the one decision.",
      chartThread:
        "Your chart can hold many threads at once, but your nervous system still deserves closure. Give yourself one clean ending.",
      leanInto: "Finishing a small loop all the way.",
      release: "Starting five things to avoid one thing.",
      smallMove: "Choose one open loop and close it before switching.",
      anchor: "Closure creates calm."
    }
  ],
  luxe: [
    {
      mood: "Future-self standards, soft power, calm money moves.",
      meaning:
        "Today favors the version of you who chooses peace before panic. Make one elevated choice that protects your time, money, or attention.",
      chartThread:
        "Gemini keeps your mind sharp, Pisces keeps your vision alive, and Libra North Node asks for graceful standards that support independence.",
      leanInto: "A polished system that makes life feel lighter.",
      release: "Mistaking chaos for ambition.",
      smallMove: "Review one money detail or upcoming deadline.",
      anchor: "Peace is part of your wealth plan."
    },
    {
      mood: "Elegant structure over hustle.",
      meaning:
        "You are not building success by exhausting yourself. You are building it through clean systems, steady study, intentional spending, and protected rest.",
      chartThread:
        "Your Pisces Moon needs softness, while Gemini loves movement. Libra turns that into a lifestyle with rhythm, beauty, and boundaries.",
      leanInto: "A routine that feels elevated and easy to repeat.",
      release: "Rushing so much that you lose the standard.",
      smallMove: "Prepare one detail your future self will thank you for.",
      anchor: "Soft discipline is still discipline."
    },
    {
      mood: "High standards, low friction.",
      meaning:
        "The upgrade today is not bigger effort. It is removing one point of friction so your better habits are easier to choose.",
      chartThread:
        "Gemini notices what is not working, Pisces feels what is draining, and Libra helps you refine the system with grace.",
      leanInto: "Making the right choice the easiest choice.",
      release: "Holding onto systems that make you feel behind.",
      smallMove: "Set up one repeating reminder, basket, note, or template.",
      anchor: "Luxury can look like fewer decisions."
    },
    {
      mood: "Calm confidence with a clean plan.",
      meaning:
        "Move like someone who trusts her direction. One finished school task, one money check-in, or one home reset is enough to shift the tone.",
      chartThread:
        "Your Libra North Node pulls you toward peace, partnership, beauty, and better standards. Let the day reflect that without needing perfection.",
      leanInto: "The choice that makes you feel composed.",
      release: "Performing productivity for pressure.",
      smallMove: "Pick the one action that makes tonight feel handled.",
      anchor: "Composed is a power move."
    },
    {
      mood: "Feminine discipline, quiet authority.",
      meaning:
        "Today asks you to lead your life softly but clearly. Set the tone before the day sets it for you.",
      chartThread:
        "Gemini brings the ideas, Pisces brings the feeling, and Libra asks you to turn both into an environment that respects your future.",
      leanInto: "A graceful no, a clean yes, and a shorter list.",
      release: "Letting urgency decide your standards.",
      smallMove: "Choose one thing to decline, delay, or delegate.",
      anchor: "Your energy deserves a budget too."
    },
    {
      mood: "Elevated home base, elevated mind.",
      meaning:
        "A calmer space can help your focus return. Give your homepage, desk, bag, or evening routine one small refinement.",
      chartThread:
        "Pisces Moon is affected by the room. Gemini Sun works better with visible cues. Libra North Node wants the whole system to feel beautiful and usable.",
      leanInto: "Beauty that makes the practical easier.",
      release: "Waiting until life is perfect to make it feel nice.",
      smallMove: "Refresh one tiny area you touch every day.",
      anchor: "Your environment can remind you who you are becoming."
    },
    {
      mood: "Independent, steady, and well-held.",
      meaning:
        "Today supports a quiet wealth-building choice. Track, plan, learn, apply, save, study, or simplify one thing that strengthens your independence.",
      chartThread:
        "Your Gemini Sun can learn the strategy, your Pisces Moon keeps the dream personal, and Libra North Node chooses sustainable support.",
      leanInto: "One action that increases future options.",
      release: "Short-term comfort that steals long-term ease.",
      smallMove: "Check one account, deadline, form, or next requirement.",
      anchor: "Independence is built through repeatable care."
    }
  ]
};

const elements = {
  dateLine: document.getElementById("dateLine"),
  moodLine: document.getElementById("moodLine"),
  dailyMeaning: document.getElementById("dailyMeaning"),
  chartThread: document.getElementById("chartThread"),
  leanInto: document.getElementById("leanInto"),
  release: document.getElementById("release"),
  smallMove: document.getElementById("smallMove"),
  dailyAnchor: document.getElementById("dailyAnchor"),
  voiceButtons: Array.from(document.querySelectorAll(".voice-button"))
};

function getStoredVoice() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function setStoredVoice(voice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, voice);
  } catch (error) {
    // The widget still works if Notion or the browser blocks storage.
  }
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86_400_000);
}

function getDailyEntry(voice) {
  const entries = dailyEntries[voice] || dailyEntries[DEFAULT_VOICE];
  const dayIndex = (getDayOfYear(new Date()) - 1) % entries.length;
  return entries[dayIndex];
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

function updateButtons(selectedVoice) {
  elements.voiceButtons.forEach((button) => {
    const isSelected = button.dataset.voice === selectedVoice;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function renderVoice(voice) {
  const selectedVoice = dailyEntries[voice] ? voice : DEFAULT_VOICE;
  const entry = getDailyEntry(selectedVoice);

  elements.dateLine.textContent = formatDate(new Date());
  elements.moodLine.textContent = entry.mood;
  elements.dailyMeaning.textContent = entry.meaning;
  elements.chartThread.textContent = entry.chartThread;
  elements.leanInto.textContent = entry.leanInto;
  elements.release.textContent = entry.release;
  elements.smallMove.textContent = entry.smallMove;
  elements.dailyAnchor.textContent = entry.anchor;

  updateButtons(selectedVoice);
  setStoredVoice(selectedVoice);
}

elements.voiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderVoice(button.dataset.voice);
  });
});

renderVoice(getStoredVoice() || DEFAULT_VOICE);
