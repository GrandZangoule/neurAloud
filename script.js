let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let capturedText = '';
let db;

window.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  loadSettings();
  restoreLastFile();
  loadTTSEngines('listen');
  loadTTSEngines('capture');
  restoreSection();
});

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);
    request.onerror = () => reject("DB failed");
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("settings", { keyPath: "key" });
    };
  });
}

function saveToLibrary(type) {
  const name = prompt("Save as filename:", localStorage.getItem("lastFileName") || "untitled");
  if (!name) return;
  const content = type === 'listen' ? localStorage.getItem("lastText") : capturedText;
  const list = document.getElementById(type === 'listen' ? "listen-library-list" : "capture-library-list");
  const item = document.createElement("div");
  item.className = "library-item";
  item.textContent = name;
  item.draggable = true;
  item.ondragstart = (e) => e.dataTransfer.setData("text/plain", JSON.stringify({ name, content }));
  const del = document.createElement("button");
  del.textContent = "−";
  del.onclick = () => list.removeChild(item);
  item.appendChild(del);
  list.appendChild(item);
}

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  localStorage.setItem("lastFileName", file.name);

  if (file.type === "application/pdf") {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let text = "";
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      document.getElementById("text-display").innerHTML = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
        document.getElementById("text-display").appendChild(canvas.cloneNode(true));
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      localStorage.setItem("lastText", text);
      sentences = text.split(/(?<=[.?!])\s+/);
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = () => {
      const text = reader.result;
      localStorage.setItem("lastText", text);
      sentences = text.split(/(?<=[.?!])\s+/);
      displayText(sentences);
    };
    reader.readAsText(file);
  }
}

function displayText(sentencesArr) {
  const html = sentencesArr.map((s, i) => `<span class="sentence" data-index="${i}">${s}</span>`).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) =>
    el.classList.toggle("highlight", i === index)
  );
}

function play() {
  if (!sentences.length) return alert("Please load a document first.");
  if (utterance && speechSynthesis.paused) return speechSynthesis.resume();
  speakSentence(currentSentenceIndex);
}

function speakSentence(index) {
  if (index >= sentences.length) {
    if (isLooping) currentSentenceIndex = 0;
    else return stop();
  }

  const sentence = sentences[currentSentenceIndex];
  highlightSentence(currentSentenceIndex);

  utterance = new SpeechSynthesisUtterance(sentence);
  utterance.rate = parseFloat(document.getElementById("rate").value);
  utterance.pitch = parseFloat(document.getElementById("pitch").value);

  utterance.onend = () => {
    currentSentenceIndex++;
    speakSentence(currentSentenceIndex);
  };

  speechSynthesis.speak(utterance);
}

function playCaptured() {
  const voice = document.getElementById("capture-voice-select").value;
  const tts = new SpeechSynthesisUtterance(capturedText);
  tts.voice = speechSynthesis.getVoices().find(v => v.name === voice);
  tts.rate = parseFloat(document.getElementById("capture-rate").value);
  tts.pitch = parseFloat(document.getElementById("capture-pitch").value);
  speechSynthesis.speak(tts);
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
  alert("Loop is now " + (isLooping ? "enabled" : "disabled"));
}

function translateText() {
  alert("🌍 Translation feature is coming soon!");
}

function startCapture() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = document.getElementById("capture-lang-in").value;
  recognition.continuous = true;
  recognition.onresult = (event) => {
    capturedText = Array.from(event.results).map(r => r[0].transcript).join(" ");
    document.getElementById("capture-display").innerText = capturedText;
  };
  recognition.start();
}

function changeTTSEngine(section) {
  const engine = document.getElementById(section === "listen" ? "tts-engine" : "capture-tts-engine").value;
  const voiceSelect = document.getElementById(section === "listen" ? "voice-select" : "capture-voice-select");
  voiceSelect.innerHTML = "";
  const voices = speechSynthesis.getVoices().filter(v => v.name.toLowerCase().includes(engine));
  voices.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

function changeVoice(section) {
  const voice = document.getElementById(section === "listen" ? "voice-select" : "capture-voice-select").value;
  localStorage.setItem(section + "-voice", voice);
}

function loadTTSEngines(section) {
  const engines = ["default", "google", "ibm", "responsivevoice"];
  const select = document.getElementById(section === "listen" ? "tts-engine" : "capture-tts-engine");
  engines.forEach(engine => {
    const opt = document.createElement("option");
    opt.value = engine;
    opt.textContent = engine.toUpperCase();
    select.appendChild(opt);
  });
}

function restoreSection() {
  const section = localStorage.getItem("lastSection") || "home";
  navigate(section);
}

function navigate(tab) {
  localStorage.setItem("lastSection", tab);
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(tab).style.display = "block";
}

function loadSettings() {
  document.getElementById("rate").value = localStorage.getItem("rate") || 1;
  document.getElementById("pitch").value = localStorage.getItem("pitch") || 1;
  document.getElementById("capture-rate").value = localStorage.getItem("capture-rate") || 1;
  document.getElementById("capture-pitch").value = localStorage.getItem("capture-pitch") || 1;
}

function restoreLastFile() {
  const last = localStorage.getItem("lastText");
  if (last) {
    sentences = last.split(/(?<=[.?!])\s+/);
    displayText(sentences);
  }
}
