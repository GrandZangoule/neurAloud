let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let db;
let currentFilename = "";
let loadedCanvas = [];

window.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  restoreState();
  loadVoices();
  loadLibrary();
  loadPlaylist();

  const lastText = localStorage.getItem("lastText");
  currentFilename = localStorage.getItem("lastFilename") || "";

  if (lastText) {
    displayText(lastText);
    currentSentenceIndex = parseInt(localStorage.getItem("lastIndex") || "0");
    if (document.getElementById("auto-resume-toggle")?.checked) play();
  }

  const fileWasPDF = localStorage.getItem("lastFileType") === "pdf";
  if (fileWasPDF) renderPersistedPDF();
});

function restoreState() {
  const section = localStorage.getItem("activeTab") || "home";
  navigate(section);
  document.getElementById("rate").value = localStorage.getItem("rate") || "1.00";
  document.getElementById("pitch").value = localStorage.getItem("pitch") || "1.00";
  document.getElementById("rateVal").textContent = document.getElementById("rate").value;
  document.getElementById("pitchVal").textContent = document.getElementById("pitch").value;
  document.getElementById("tts-engine").value = localStorage.getItem("engine") || "default";
  document.getElementById("voice-select").value = localStorage.getItem("voice") || "";
  document.getElementById("auto-resume-toggle").checked = localStorage.getItem("autoResume") === "true";
}

function navigate(tab) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(tab).style.display = "block";
  localStorage.setItem("activeTab", tab);
}

document.getElementById("rate").oninput = (e) => {
  const val = parseFloat(e.target.value).toFixed(2);
  document.getElementById("rateVal").textContent = val;
  localStorage.setItem("rate", val);
};

document.getElementById("pitch").oninput = (e) => {
  const val = parseFloat(e.target.value).toFixed(2);
  document.getElementById("pitchVal").textContent = val;
  localStorage.setItem("pitch", val);
};

document.getElementById("voice-select").onchange = (e) => {
  localStorage.setItem("voice", e.target.value);
};

function toggleAutoResume() {
  const checked = document.getElementById("auto-resume-toggle").checked;
  localStorage.setItem("autoResume", checked);
}

function changeTTSEngine() {
  const engine = document.getElementById("tts-engine").value;
  localStorage.setItem("engine", engine);
}

function loadVoices() {
  const select = document.getElementById("voice-select");
  select.innerHTML = "";
  const voices = speechSynthesis.getVoices();

  const langMap = {};
  voices.forEach(voice => {
    const lang = voice.lang;
    if (!langMap[lang]) langMap[lang] = [];
    langMap[lang].push(voice);
  });

  const sortedLangs = Object.keys(langMap).sort();

  sortedLangs.forEach(lang => {
    langMap[lang].forEach(voice => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      select.appendChild(opt);
    });
  });

  const saved = localStorage.getItem("voice");
  if (saved) select.value = saved;
}
speechSynthesis.onvoiceschanged = loadVoices;

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  clearPDFCanvas();

  const ext = file.name.split(".").pop().toLowerCase();
  currentFilename = file.name;
  localStorage.setItem("lastFilename", currentFilename);

  const reader = new FileReader();
  const container = document.getElementById("text-display");
  container.innerHTML = "";

  if (ext === "pdf") {
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let fullText = "";
      let pages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        await page.render({ canvasContext: context, viewport }).promise;
        container.appendChild(canvas);
        loadedCanvas.push(canvas);

        const content = await page.getTextContent();
        const textPage = content.items.map(item => item.str).join(" ");
        fullText += textPage + " ";
        pages.push(canvas.toDataURL("image/png"));
      }

      localStorage.setItem("lastText", fullText.trim());
      localStorage.setItem("lastFileType", "pdf");
      localStorage.setItem("pdfPages", JSON.stringify(pages));
      displayText(fullText.trim());
    };
    reader.readAsArrayBuffer(file);
  }
}

function renderPersistedPDF() {
  const pages = JSON.parse(localStorage.getItem("pdfPages") || "[]");
  const container = document.getElementById("text-display");
  container.innerHTML = "";
  pages.forEach(dataUrl => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.width = "100%";
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
    container.appendChild(canvas);
    loadedCanvas.push(canvas);
  });
}

function clearPDFCanvas() {
  loadedCanvas.forEach(canvas => canvas.remove());
  loadedCanvas = [];
  document.getElementById("text-display").innerHTML = "";
}

function displayText(text) {
  sentences = text.split(/(?<=[.?!])\s+/);
}

function play() {
  if (!sentences.length) return alert("Please load a document.");
  if (utterance && speechSynthesis.paused) return speechSynthesis.resume();
  speakSentence(currentSentenceIndex);
}

function speakSentence(index) {
  if (index >= sentences.length) {
    if (isLooping) currentSentenceIndex = 0;
    else return stop();
  }

  const sentence = sentences[currentSentenceIndex];
  localStorage.setItem("lastIndex", currentSentenceIndex);
  utterance = new SpeechSynthesisUtterance(sentence);
  utterance.rate = parseFloat(document.getElementById("rate").value);
  utterance.pitch = parseFloat(document.getElementById("pitch").value);
  const selected = document.getElementById("voice-select").value;
  const voice = speechSynthesis.getVoices().find(v => v.name === selected);
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    currentSentenceIndex++;
    speakSentence(currentSentenceIndex);
  };

  speechSynthesis.speak(utterance);
}

function pause() { if (speechSynthesis.speaking) speechSynthesis.pause(); }
function stop() { speechSynthesis.cancel(); currentSentenceIndex = 0; }
function jumpTo(index) { stop(); currentSentenceIndex = index; play(); }
function toggleLoop() { isLooping = !isLooping; alert("Loop: " + isLooping); }
function resetZoom() {
  const box = document.getElementById("text-display");
  box.style.transform = "scale(1)";
  box.scrollTo({ top: 0 });
}
function translateText() { alert("Translation coming soon."); }

async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);
    request.onerror = () => reject("IndexedDB failed");
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore("files", { keyPath: "name" });
      db.createObjectStore("playlist", { keyPath: "name" });
    };
  });
}

function saveCurrentFile() {
  if (!sentences.length) return;
  const name = prompt("Save as:", currentFilename || "untitled.txt");
  if (!name) return;
  const content = localStorage.getItem("lastText") || "";
  db.transaction("files", "readwrite").objectStore("files").put({ name, content }).onsuccess = loadLibrary;
}

function loadLibrary() {
  const tx = db.transaction("files", "readonly").objectStore("files");
  tx.getAll().onsuccess = (e) => {
    const container = document.getElementById("library-list");
    container.innerHTML = "";
    e.target.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "library-item";
      div.textContent = file.name;
      const btn = document.createElement("button");
      btn.textContent = "➕";
      btn.onclick = () => addToPlaylist(file);
      div.appendChild(btn);
      container.appendChild(div);
    });
  };
}

function addToPlaylist(file) {
  db.transaction("playlist", "readwrite").objectStore("playlist").put(file).onsuccess = loadPlaylist;
}

function loadPlaylist() {
  const tx = db.transaction("playlist", "readonly").objectStore("playlist");
  tx.getAll().onsuccess = (e) => {
    const container = document.getElementById("playlist-list");
    container.innerHTML = "";
    e.target.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "playlist-item";
      div.textContent = file.name;
      container.appendChild(div);
    });
  };
}

function playPlaylist() {
  const tx = db.transaction("playlist", "readonly").objectStore("playlist");
  tx.getAll().onsuccess = async (e) => {
    for (const file of e.target.result) {
      localStorage.setItem("lastText", file.content);
      displayText(file.content);
      currentSentenceIndex = 0;
      await new Promise(resolve => {
        const step = () => {
          if (currentSentenceIndex >= sentences.length) return resolve();
          const u = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
          u.rate = parseFloat(document.getElementById("rate").value);
          u.pitch = parseFloat(document.getElementById("pitch").value);
          u.onend = () => { currentSentenceIndex++; step(); };
          speechSynthesis.speak(u);
        };
        step();
      });
    }
  };
}
