const laws = [
  { number: "LAW 01", title: "Master the art of timing", summary: "The right action at the wrong moment still creates the wrong result.", tags: ["strategy", "self-mastery", "awareness"], hook: "Your timing is<br /><em>your power.</em>", body: "A good decision made too early can be just as dangerous as a bad one." },
  { number: "LAW 07", title: "Turn effort into leverage", summary: "Work smarter by building systems that let your effort travel further.", tags: ["leverage", "work", "focus"], hook: "Stop trading time<br /><em>for progress.</em>", body: "The goal is not to do more. It is to make each move create a second result." },
  { number: "LAW 17", title: "Make absence create value", summary: "What is always available is easy to overlook. Space can sharpen attention.", tags: ["attention", "value", "boundaries"], hook: "Sometimes the most<br /><em>powerful move is space.</em>", body: "Give people room to feel your absence, not a reason to take you for granted." },
  { number: "LAW 24", title: "Know when to say less", summary: "Restraint lets your actions speak with more force than constant explanation.", tags: ["restraint", "influence", "clarity"], hook: "You do not need to<br /><em>explain your power.</em>", body: "Say what matters. Then let your consistency do the convincing." },
];
let activeLaw = 0;
const scenes = [
  { label: "Hook", visual: "Clock hand · close-up", caption: "Your timing is your power.", duration: 8 },
  { label: "Tension", visual: "City · time-lapse", caption: "A good decision can still be too early.", duration: 12 },
  { label: "Pause", visual: "Message · unsent", caption: "Timing is not hesitation.", duration: 11 },
  { label: "Insight", visual: "Sky · passing clouds", caption: "Watch the room. Study the pattern.", duration: 11 },
  { label: "Payoff", visual: "First step · forward", caption: "Move when the moment is ready.", duration: 10 },
];
const demoDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
let demoSeconds = 0;
let demoTimer;
let demoPlaying = false;
let audioContext;
let audioTimer;
let audioMuted = false;

const $ = (id) => document.getElementById(id);
const toast = (message) => {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  window.setTimeout(() => $("toast").classList.remove("show"), 2200);
};

function renderLaw() {
  const law = laws[activeLaw];
  $("lawNumber").textContent = law.number;
  $("lawTitle").textContent = law.title;
  $("lawSummary").textContent = law.summary;
  $("lawTags").innerHTML = law.tags.map((tag) => `<span>${tag}</span>`).join("");
  $("previewHook").innerHTML = law.hook;
  $("previewBody").textContent = law.body;
  $("sceneBadge").textContent = `${law.number} / 48 · SCENE 01`;
}

function currentScene() {
  let elapsed = 0;
  for (let index = 0; index < scenes.length; index += 1) {
    if (demoSeconds < elapsed + scenes[index].duration) return { scene: scenes[index], index };
    elapsed += scenes[index].duration;
  }
  return { scene: scenes[scenes.length - 1], index: scenes.length - 1 };
}

function renderDemo() {
  const { scene, index } = currentScene();
  const percent = (demoSeconds / demoDuration) * 100;
  $("demoProgress").style.width = `${percent}%`;
  $("phoneProgress").style.width = `${percent}%`;
  $("demoTime").textContent = `00:${String(Math.floor(demoSeconds)).padStart(2, "0")} / 00:${String(demoDuration).padStart(2, "0")}`;
  $("sceneBadge").textContent = `${laws[activeLaw].number} / 48 · SCENE ${String(index + 1).padStart(2, "0")}`;
  $("animatedCaption").textContent = scene.caption;
  $("videoCanvas").dataset.scene = index;
  document.querySelectorAll(".scene-card").forEach((card, cardIndex) => card.classList.toggle("active", cardIndex === index));
  $("playDemo").textContent = demoPlaying ? "Ⅱ" : "▶";
}

function renderSceneStrip() {
  $("sceneStrip").innerHTML = scenes.map((scene, index) => `<button class="scene-card${index === 0 ? " active" : ""}" data-scene="${index}"><b>0${index + 1}</b><span>${scene.label}</span><small>${scene.visual}</small></button>`).join("");
  document.querySelectorAll(".scene-card").forEach((card) => card.addEventListener("click", () => {
    let start = 0;
    for (let index = 0; index < Number(card.dataset.scene); index += 1) start += scenes[index].duration;
    demoSeconds = start;
    renderDemo();
  }));
}

function toggleDemo() {
  demoPlaying = !demoPlaying;
  if (demoPlaying) {
    startAudio();
    if (demoSeconds >= demoDuration) demoSeconds = 0;
    demoTimer = window.setInterval(() => {
      demoSeconds += 1;
      if (demoSeconds >= demoDuration) {
        demoSeconds = demoDuration;
        demoPlaying = false;
        window.clearInterval(demoTimer);
      }
      renderDemo();
    }, 1000);
  } else {
    window.clearInterval(demoTimer);
    stopAudio();
  }
}

function startAudio() {
    if (audioMuted) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    stopAudio();
    if ("speechSynthesis" in window) {
      const narration = new SpeechSynthesisUtterance(`${laws[activeLaw].title}. ${laws[activeLaw].body} Watch the room. Study the pattern. Move when the moment is ready.`);
      narration.rate = 0.9;
      narration.pitch = 1;
      narration.volume = 0.8;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(narration);
    }
    const notes = [220, 261.63, 329.63, 392];
    let note = 0;
    const playNote = () => {
      if (!demoPlaying || audioMuted) return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = notes[note % notes.length];
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.55);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.6);
      note += 1;
    };
    playNote();
    audioTimer = window.setInterval(playNote, 700);
  }

function stopAudio() {
    window.clearInterval(audioTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

function showView(viewName) {
    document.querySelectorAll("[data-page-view]").forEach((view) => view.classList.toggle("visible", view.dataset.pageView === viewName));
    document.querySelectorAll("[data-view]").forEach((link) => link.classList.toggle("active", link.dataset.view === viewName));
    $("studio").classList.toggle("viewing-subpage", viewName !== "studio");
    document.querySelector(".breadcrumbs strong").textContent = viewName === "studio" ? "New video" : viewName[0].toUpperCase() + viewName.slice(1);
    if (viewName === "library") renderLibrary();
    if (viewName === "drafts") renderDrafts();
  }

function renderLibrary() {
    $("lawGrid").innerHTML = laws.map((law, index) => `<button class="law-card" data-law-index="${index}"><span>${law.number}</span><strong>${law.title}</strong><small>${law.summary}</small></button>`).join("");
    document.querySelectorAll(".law-card").forEach((card) => card.addEventListener("click", () => {
      activeLaw = Number(card.dataset.lawIndex);
      renderLaw();
      showView("studio");
      toast(`${laws[activeLaw].number} loaded into Studio`);
    }));
  }

function renderDrafts() {
    const source = document.querySelector(".draft-grid");
    const target = document.querySelector(".draft-grid-view");
    if (source && target) target.innerHTML = source.innerHTML;
  }

function storyboardText() {
  const law = laws[activeLaw];
  return `DAILY LAWS STUDIO — QWEN VIDEO STORYBOARD

TITLE: ${law.title}
FORMAT: 9:16 vertical TikTok lesson
LENGTH: ${demoDuration} seconds
AUDIENCE: ${$("audience").value}
ENERGY: ${$("energy").selectedOptions[0].text}

NARRATION:
${law.hook.replace(/<br ?\/?>|<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}

${law.body}

SCENES:
${scenes.map((scene, index) => `${index + 1}. ${scene.label} (${scene.duration}s)\n   Visual: ${scene.visual}\n   On-screen caption: ${scene.caption}`).join("\n")}

PRODUCTION PROMPT:
Create a cinematic, intelligent, modern 9:16 short-form educational video. Use dark charcoal, warm amber, muted lime accents, subtle film grain, smooth camera motion, clean kinetic typography, and accurate burned-in captions. Use original cinematic b-roll matching each scene. Avoid logos, copyrighted characters, and recognizable celebrities.`;
}

$("shuffleLaw").addEventListener("click", () => {
  activeLaw = (activeLaw + 1) % laws.length;
  renderLaw();
  renderDemo();
  toast("New law loaded");
});

["visualToggle", "promptToggle"].forEach((id) => {
  $(id).addEventListener("click", (event) => event.currentTarget.classList.toggle("on"));
});

$("generate").addEventListener("click", () => {
  const words = $("format").value === "list" ? 145 : $("format").value === "story" ? 165 : 130;
  $("duration").textContent = `${Math.round(words / 2.5)} seconds · ${words} words`;
  demoSeconds = 0;
  demoPlaying = false;
  window.clearInterval(demoTimer);
  renderDemo();
  toast("Your script is ready to edit");
});

$("copyScript").addEventListener("click", async () => {
  const law = laws[activeLaw];
  const script = `${law.title}\n\n${law.body}\n\nWhat does this look like in your life?`;
  try {
    await navigator.clipboard.writeText(script);
    toast("Script copied to clipboard");
  } catch {
    toast("Script ready to copy");
  }
});

$("downloadStoryboard").addEventListener("click", () => {
  const blob = new Blob([storyboardText()], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "daily-laws-qwen-storyboard.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  toast("Storyboard downloaded");
});
$("playDemo").addEventListener("click", toggleDemo);
$("restartDemo").addEventListener("click", () => {
  demoSeconds = 0;
  demoPlaying = false;
  window.clearInterval(demoTimer);
  stopAudio();
  renderDemo();
});
$("muteDemo").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("muted");
  audioMuted = event.currentTarget.classList.contains("muted");
  if (audioMuted) stopAudio();
  else if (demoPlaying) startAudio();
  toast(audioMuted ? "Demo audio muted" : "Demo audio on");
});
$("editScript").addEventListener("click", () => toast("Script editor opens after generation"));
$("browseLaws").addEventListener("click", () => toast("Law library coming right up"));

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") $("generate").click();
});

renderSceneStrip();
renderDemo();
document.querySelectorAll("[data-view]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  showView(link.dataset.view);
  history.replaceState(null, "", `#${link.dataset.view}`);
}));
document.querySelector("#libraryCreate").addEventListener("click", () => showView("studio"));
document.querySelector("#draftCreate").addEventListener("click", () => showView("studio"));
document.querySelector("#calendarAdd").addEventListener("click", () => toast("Content slot added to your calendar"));
if (window.location.hash.slice(1) && document.querySelector(`[data-page-view="${window.location.hash.slice(1)}"]`)) showView(window.location.hash.slice(1));
