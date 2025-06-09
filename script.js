let utterance, captureUtterance;
let currentSentenceIndex = 0;
let sentences = [];
let capturedText = "";
let isLooping = false;

window.addEventListener("DOMContentLoaded", () => {
  restoreState();
  loadTTSEngines("listen");
  loadTTSEngines("capture");
  loadLibrary();
});

function navigate(tab) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  document.getElementById(tab).classList.add("active-section");
  localStorage.setItem("lastTab", tab);
}

function restoreState() {
  const lastTab = localStorage.getItem("lastTab") || "home";
  navigate(lastTab);

  document.getElementById("rate").value = localStorage.getItem("rate") || 1;
  document.getElementById("pitch").value = localStorage.getItem("pitch") || 1;
  document.getElementById("capture-rate").value = localStorage.getItem("capture-rate") || 1;
  document.getElementById("capture-pitch").value = localStorage.getItem("capture-pitch") || 1;

  const lastText = localStorage.getItem("lastText");
  if (lastText) displayText(lastText);
  const lastCapture = localStorage.getItem("lastCapture");
  if (lastCapture) displayCaptured(lastCapture);
}

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === "txt") {
    reader.onload = () => {
      const text = reader.result;
      localStorage.setItem("lastText", text);
      displayText(text);
    };
    reader.readAsText(file);
  } else {
    alert("Only .txt supported right now. Full PDF/Docx supported in next patch.");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=[.?!])\s+/);
  const html = sentences.map((s, i) => `<span class="sentence" data-index="${i}">${s}</span>`).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) =>
    el.classList.toggle("highlight", i === index)
  );
}

function play() {
  if (!sentences.length) return alert("Please load a document first.");
  const rate = parseFloat(document.getElementById("rate").value);
  const pitch = parseFloat(document.getElementById("pitch").value);
  localStorage.setItem("rate", rate);
  localStorage.setItem("pitch", pitch);

  if (utterance && speechSynthesis.paused) return speechSynthesis.resume();

  speakSentence(currentSentenceIndex, rate, pitch);
}

function speakSentence(index, rate, pitch) {
  if (index >= sentences.length) {
    if (isLooping) currentSentenceIndex = 0;
    else return stop();
  }

  highlightSentence(currentSentenceIndex);
  utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
  utterance.rate = rate;
  utterance.pitch = pitch;

  utterance.onend = () => {
    currentSentenceIndex++;
    speakSentence(currentSentenceIndex, rate, pitch);
  };

  speechSynthesis.speak(utterance);
}

function pause() {
  if (speechSynthesis.speaking) speechSynthesis.pause();
}

function stop() {
  speechSynthesis.cancel();
  currentSentenceIndex = 0;
  highlightSentence(-1);
}

function toggleLoop() {
  isLooping = !isLooping;
  alert("Looping is now " + (isLooping ? "enabled" : "disabled"));
}

function changeTTSEngine(section) {
  const engine = document.getElementById(section === 'capture' ? 'capture-tts-engine' : 'tts-engine').value;
  const voices = getVoicesForEngine(engine);
  const select = document.getElementById(section === 'capture' ? 'capture-voice-select' : 'voice-select');
  select.innerHTML = voices.map(v => `<option value="${v.value}">${v.label}</option>`).join("");
}

function changeVoice(section) {
  // Store for persistence later if needed
}

function getVoicesForEngine(engine) {
  const voices = {
    google: [
      { label: "en-US-Wavenet-D (Male)", value: "en-US-Wavenet-D" },
      { label: "es-ES-Wavenet-B (Male)", value: "es-ES-Wavenet-B" },
      { label: "fr-FR-Wavenet-C (Female)", value: "fr-FR-Wavenet-C" }
    ],
    ibm: [
      { label: "Allison (en-US)", value: "en-US_AllisonV3Voice" },
      { label: "Lucia (es-ES)", value: "es-ES_LauraVoice" },
      { label: "René (fr-FR)", value: "fr-FR_ReneeV3Voice" }
    ],
    responsivevoice: [
      { label: "UK English Female", value: "UK English Female" },
      { label: "US English Male", value: "US English Male" }
    ],
    default: [{ label: "Default Voice", value: "default" }]
  };
  return voices[engine] || voices["default"];
}

function loadTTSEngines(section) {
  const select = document.getElementById(section === 'capture' ? 'capture-tts-engine' : 'tts-engine');
  select.innerHTML = `
    <option value="default">Default TTS</option>
    <option value="google">Google TTS</option>
    <option value="ibm">IBM Watson</option>
    <option value="responsivevoice">ResponsiveVoice</option>
  `;
  changeTTSEngine(section);
}

function saveToLibrary(section) {
  const content = section === "listen"
    ? document.getElementById("text-display").innerText
    : document.getElementById("capture-display").innerText;
  const entry = { id: Date.now(), text: content };
  const key = section === "listen" ? "listenLibrary" : "captureLibrary";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.unshift(entry);
  localStorage.setItem(key, JSON.stringify(list));
  loadLibrary();
}

function loadLibrary() {
  ["listen", "capture"].forEach(section => {
    const key = section + "Library";
    const container = document.getElementById(section + "-library-list");
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    container.innerHTML = list.map(item => `
      <div>
        ${item.text.substring(0, 50)}...
        <button onclick="removeFromLibrary('${key}', ${item.id})">➖</button>
      </div>
    `).join("");
  });
}

function removeFromLibrary(key, id) {
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
  loadLibrary();
}

function startCapture() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  capturedText = "";
  recognition.onresult = (event) => {
    capturedText = Array.from(event.results)
      .map(r => r[0].transcript)
      .join(" ");
    displayCaptured(capturedText);
    localStorage.setItem("lastCapture", capturedText);
  };
  recognition.onerror = (e) => {
    alert("Speech recognition error: " + e.error);
  };
  recognition.start();
}

function displayCaptured(text) {
  document.getElementById("capture-display").innerText = text;
}

function playCaptured() {
  const text = document.getElementById("capture-display").innerText;
  const rate = parseFloat(document.getElementById("capture-rate").value);
  const pitch = parseFloat(document.getElementById("capture-pitch").value);
  localStorage.setItem("capture-rate", rate);
  localStorage.setItem("capture-pitch", pitch);

  captureUtterance = new SpeechSynthesisUtterance(text);
  captureUtterance.rate = rate;
  captureUtterance.pitch = pitch;
  speechSynthesis.speak(captureUtterance);
}
