let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let capturedText = '';
let db;
let lastPdfData = null;

window.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  loadSettings();
  restoreLastFile();
  loadTTSEngines("listen");
  loadTTSEngines("capture");
  restoreSection();
});

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("neurAloudDB", 1);
    req.onerror = () => reject("DB failed");
    req.onsuccess = () => {
      db = req.result;
      resolve();
    };
    req.onupgradeneeded = e => {
      db = e.target.result;
      db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("settings", { keyPath: "key" });
    };
  });
}

function saveToLibrary(type) {
  const name = prompt("Save as filename:", localStorage.getItem("lastFileName") || "untitled");
  if (!name) return;
  const content = type === "listen" ? localStorage.getItem("lastText") : capturedText;
  const list = document.getElementById(type === "listen" ? "listen-library-list" : "capture-library-list");
  const item = document.createElement("div");
  item.className = "library-item";
  item.textContent = name;
  item.draggable = true;
  item.ondragstart = e => e.dataTransfer.setData("text/plain", JSON.stringify({ name, content }));
  const del = document.createElement("button");
  del.textContent = "−";
  del.onclick = () => {
    if (confirm("Are you sure you want to remove this item?")) {
      list.removeChild(item);
    }
  };
  item.appendChild(del);
  list.appendChild(item);
}

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  localStorage.setItem("lastFileName", file.name);

  const reader = new FileReader();
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      localStorage.setItem("lastPdfData", JSON.stringify(Array.from(typedArray)));
      renderPdf(typedArray);
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === "docx") {
    reader.onload = async () => {
      const result = await mammoth.convertToText({ arrayBuffer: reader.result });
      const text = result.value;
      localStorage.setItem("lastText", text);
      sentences = text.split(/(?<=[.?!])\s+/);
      displayText(sentences);
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

async function renderPdf(dataArray) {
  const pdf = await pdfjsLib.getDocument({ data: dataArray }).promise;
  const container = document.getElementById("text-display");
  container.innerHTML = "";
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;
    container.appendChild(canvas);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(" ") + "\n";
  }

  localStorage.setItem("lastText", text);
  sentences = text.split(/(?<=[.?!])\s+/);
}

function displayText(sentencesArr) {
  const html = sentencesArr.map((s, i) => `<span class="sentence" data-index="${i}">${s}</span>`).join(" ");
  document.getElementById("text-display").innerHTML += html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) =>
    el.classList.toggle("highlight", i === index)
  );
}
function speakCurrent() {
  if (currentSentenceIndex >= sentences.length) {
    if (isLooping) currentSentenceIndex = 0;
    else return;
  }

  const sentence = sentences[currentSentenceIndex];
  utterance = new SpeechSynthesisUtterance(sentence);
  highlightSentence(currentSentenceIndex);

  utterance.rate = parseFloat(document.getElementById("rate-slider").value);
  utterance.pitch = parseFloat(document.getElementById("pitch-slider").value);
  utterance.voice = speechSynthesis.getVoices().find(
    v => v.name === document.getElementById("voice-select").value
  );

  utterance.onend = () => {
    currentSentenceIndex++;
    speakCurrent();
  };

  speechSynthesis.speak(utterance);
}

function pauseSpeech() {
  speechSynthesis.pause();
}

function resumeSpeech() {
  speechSynthesis.resume();
}

function stopSpeech() {
  speechSynthesis.cancel();
  highlightSentence(-1);
  currentSentenceIndex = 0;
}

function loadTTSEngines(section) {
  const select = document.getElementById(section + "-voice-select");
  select.innerHTML = "";
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices().forEach(v => {
      const opt = document.createElement("option");
      opt.textContent = v.name;
      opt.value = v.name;
      select.appendChild(opt);
    });
  };
  speechSynthesis.onvoiceschanged();
}

function switchSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  document.getElementById(id).classList.add("active-section");
  localStorage.setItem("lastSection", id);
}

function restoreSection() {
  const section = localStorage.getItem("lastSection");
  if (section) switchSection(section);
}

function restoreLastFile() {
  const lastText = localStorage.getItem("lastText");
  const lastPdfRaw = localStorage.getItem("lastPdfData");
  if (lastPdfRaw) {
    const uint8array = new Uint8Array(JSON.parse(lastPdfRaw));
    renderPdf(uint8array);
  } else if (lastText) {
    sentences = lastText.split(/(?<=[.?!])\s+/);
    displayText(sentences);
  }
}

document.getElementById("file-input").addEventListener("change", loadFile);
document.getElementById("play-btn").addEventListener("click", speakCurrent);
document.getElementById("pause-btn").addEventListener("click", pauseSpeech);
document.getElementById("resume-btn").addEventListener("click", resumeSpeech);
document.getElementById("stop-btn").addEventListener("click", stopSpeech);
document.getElementById("loop-btn").addEventListener("click", () => {
  isLooping = !isLooping;
  document.getElementById("loop-btn").textContent = isLooping ? "Loop: On" : "Loop: Off";
});

document.getElementById("save-listen").addEventListener("click", () => saveToLibrary("listen"));
document.getElementById("save-capture").addEventListener("click", () => saveToLibrary("capture"));
