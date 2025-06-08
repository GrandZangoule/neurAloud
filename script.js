let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let db;
let currentFilename = "";

window.addEventListener("DOMContentLoaded", async () => {
  restoreState();
  await initDB();
  loadVoices();
  loadLibrary();
  loadPlaylist();

  const lastText = localStorage.getItem("lastText");
  currentFilename = localStorage.getItem("lastFilename") || "";
  if (lastText) {
    displayText(lastText, false);
    currentSentenceIndex = parseInt(localStorage.getItem("lastIndex") || "0");
    if (document.getElementById("auto-resume-toggle").checked) play();
  }
});

function restoreState() {
  const section = localStorage.getItem("activeTab") || "home";
  navigate(section);
  document.getElementById("rate").value = localStorage.getItem("rate") || "1.00";
  document.getElementById("pitch").value = localStorage.getItem("pitch") || "1.00";
  document.getElementById("rateVal").textContent = parseFloat(document.getElementById("rate").value).toFixed(2);
  document.getElementById("pitchVal").textContent = parseFloat(document.getElementById("pitch").value).toFixed(2);
  document.getElementById("tts-engine").value = localStorage.getItem("engine") || "default";
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

  const languages = {};
  voices.forEach(voice => {
    const lang = voice.lang || "Unknown";
    if (!languages[lang]) languages[lang] = [];
    languages[lang].push(voice);
  });

  const commonLangs = ["en", "es", "pt", "la", "fr", "de"];
  const sorted = Object.keys(languages).sort((a, b) => {
    const aRank = commonLangs.findIndex(prefix => a.startsWith(prefix));
    const bRank = commonLangs.findIndex(prefix => b.startsWith(prefix));
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });

  sorted.forEach(lang => {
    languages[lang].slice(0, 3).forEach(voice => {
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

        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + " ";
      }
      localStorage.setItem("lastText", fullText.trim());
      displayText(fullText.trim(), false);
    };
    reader.readAsArrayBuffer(file);
  }
}

function displayText(text, overwrite = false) {
  sentences = text.split(/(?<=\.|\!|\?)\s/);
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
function resetZoom() { const box = document.getElementById("text-display"); box.style.transform = "scale(1)"; box.scrollTo({ top: 0 }); }
function translateText() { alert("Translation coming soon."); }

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);
    request.onerror = () => reject("Failed to open IndexedDB");
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
  const defaultName = currentFilename || "untitled.txt";
  const name = prompt("Save as:", defaultName);
  if (!name) return;
  const content = localStorage.getItem("lastText") || "";
  const tx = db.transaction("files", "readwrite").objectStore("files");
  tx.put({ name, content }).onsuccess = loadLibrary;
}

function loadLibrary() {
  const tx = db.transaction("files", "readonly").objectStore("files");
  tx.getAll().onsuccess = (e) => {
    const container = document.getElementById("library-list");
    container.innerHTML = "";
    e.target.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "library-item";
      div.draggable = true;
      div.textContent = file.name;
      div.ondragstart = (e) => e.dataTransfer.setData("fileName", file.name);
      const btn = document.createElement("button");
      btn.textContent = "➕ Playlist";
      btn.onclick = () => addToPlaylist(file);
      div.appendChild(btn);
      container.appendChild(div);
    });
  };
}

function addToPlaylist(file) {
  const tx = db.transaction("playlist", "readwrite").objectStore("playlist");
  tx.put(file).onsuccess = loadPlaylist;
}

function loadPlaylist() {
  const tx = db.transaction("playlist", "readonly").objectStore("playlist");
  tx.getAll().onsuccess = (e) => {
    const container = document.getElementById("playlist-list");
    container.innerHTML = "";
    e.target.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "playlist-item";
      div.draggable = true;
      div.textContent = file.name;
      div.ondragstart = (e) => e.dataTransfer.setData("playlistName", file.name);
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
      await new Promise(resolve => {
        let i = 0;
        const playSentence = () => {
          if (i >= sentences.length) return resolve();
          const u = new SpeechSynthesisUtterance(sentences[i]);
          u.onend = () => { i++; playSentence(); };
          speechSynthesis.speak(u);
        };
        playSentence();
      });
    }
  };
}
