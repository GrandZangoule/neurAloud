let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let db;

// DOMContentLoaded logic
window.addEventListener("DOMContentLoaded", async () => {
  // Restore settings
  document.getElementById("rate").value = localStorage.getItem("rate") || "1.00";
  document.getElementById("pitch").value = localStorage.getItem("pitch") || "1.00";
  document.getElementById("rateVal").textContent = parseFloat(document.getElementById("rate").value).toFixed(2);
  document.getElementById("pitchVal").textContent = parseFloat(document.getElementById("pitch").value).toFixed(2);
  document.getElementById("tts-engine").value = localStorage.getItem("engine") || "default";
  document.getElementById("voice-select").value = localStorage.getItem("voice") || "";
  document.getElementById("auto-resume-toggle").checked = localStorage.getItem("autoResume") === "true";

  // Load voices and restore voice
  loadVoices();

  // Initialize IndexedDB
  await initDB();
  loadLibrary();
  loadPlaylist();

  // Restore last text
  const lastText = localStorage.getItem("lastText");
  if (lastText) {
    displayText(lastText);
    currentSentenceIndex = parseInt(localStorage.getItem("lastIndex") || "0");
    if (document.getElementById("auto-resume-toggle").checked) play();
  }
});

// Update slider values live
document.getElementById("rate").oninput = (e) => {
  document.getElementById("rateVal").textContent = parseFloat(e.target.value).toFixed(2);
  localStorage.setItem("rate", e.target.value);
};
document.getElementById("pitch").oninput = (e) => {
  document.getElementById("pitchVal").textContent = parseFloat(e.target.value).toFixed(2);
  localStorage.setItem("pitch", e.target.value);
};

// Voice and engine persistence
function changeTTSEngine() {
  const engine = document.getElementById("tts-engine").value;
  localStorage.setItem("engine", engine);
}
function toggleAutoResume() {
  const checked = document.getElementById("auto-resume-toggle").checked;
  localStorage.setItem("autoResume", checked);
}
function loadVoices() {
  const select = document.getElementById("voice-select");
  select.innerHTML = "";
  const voices = speechSynthesis.getVoices();
  voices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    select.appendChild(option);
  });
  const saved = localStorage.getItem("voice");
  if (saved) select.value = saved;
  select.onchange = () => localStorage.setItem("voice", select.value);
}
speechSynthesis.onvoiceschanged = loadVoices;

// Navigation logic
function navigate(tab) {
  document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
  document.getElementById(tab).style.display = "block";
}
function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();

  if (ext === "txt") {
    reader.onload = () => {
      const text = reader.result;
      localStorage.setItem("lastText", text);
      localStorage.setItem("lastFileType", "text");
      displayText(text);
    };
    reader.readAsText(file);
  } else if (ext === "pdf") {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const typedarray = new Uint8Array(fileReader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      const container = document.getElementById("text-display");
      container.innerHTML = "";
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        container.appendChild(canvas);

        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + " ";
      }

      localStorage.setItem("lastText", fullText.trim());
      localStorage.setItem("lastFileType", "text");
      displayText(fullText.trim());
    };
    fileReader.readAsArrayBuffer(file);
  } else if (ext === "docx") {
    reader.onload = async () => {
      const container = document.getElementById("text-display");
      container.innerHTML = "";
      const result = await window.docx.renderAsync(reader.result, container);
      const text = container.innerText;
      localStorage.setItem("lastText", text);
      localStorage.setItem("lastFileType", "text");
      displayText(text);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file format.");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=\.|\!|\?)\s/);
  const html = sentences.map((s, i) =>
    `<span class="sentence" onclick="jumpTo(${i})">${s}</span>`
  ).join(" ");
  const container = document.getElementById("text-display");
  container.innerHTML += html; // Appends to PDF canvas
}

function highlightSentence(index) {
  localStorage.setItem("lastIndex", index);
  document.querySelectorAll(".sentence").forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
    if (i === index) {
      const container = document.getElementById("text-display");
      const elTop = el.offsetTop - container.offsetTop;
      const scrollTarget = elTop - container.clientHeight * 0.2;
      container.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
  });
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
  highlightSentence(currentSentenceIndex);

  utterance = new SpeechSynthesisUtterance(sentence);
  utterance.rate = parseFloat(document.getElementById("rate").value);
  utterance.pitch = parseFloat(document.getElementById("pitch").value);

  const selectedVoice = document.getElementById("voice-select").value;
  const voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice);
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    currentSentenceIndex++;
    speakSentence(currentSentenceIndex);
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
function jumpTo(index) {
  stop();
  currentSentenceIndex = index;
  play();
}
function toggleLoop() {
  isLooping = !isLooping;
  alert("Looping is now " + (isLooping ? "enabled" : "disabled"));
}
function translateText() {
  alert("🌍 Translation feature coming soon!");
}
function resetZoom() {
  const box = document.getElementById("text-display");
  box.style.transform = "scale(1)";
  box.scrollTo({ top: 0, behavior: "smooth" });
}

// IndexedDB Setup
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);
    request.onerror = () => reject("Failed to open IndexedDB");
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore("files", { keyPath: "name" });
      db.createObjectStore("playlist", { keyPath: "name" });
    };
  });
}

// Library management
function loadLibrary() {
  const tx = db.transaction("files", "readonly").objectStore("files");
  const req = tx.getAll();
  req.onsuccess = () => {
    const container = document.getElementById("library-list");
    container.innerHTML = "";
    req.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "library-item";
      div.draggable = true;
      div.textContent = file.name;
      div.ondragstart = (e) => e.dataTransfer.setData("text/plain", file.name);
      const btn = document.createElement("button");
      btn.textContent = "Add to Playlist";
      btn.onclick = () => addToPlaylist(file);
      div.appendChild(btn);
      container.appendChild(div);
    });
  };
}

function addToPlaylist(file) {
  const tx = db.transaction("playlist", "readwrite").objectStore("playlist");
  const req = tx.add(file);
  req.onsuccess = loadPlaylist;
}

// Playlist management
function loadPlaylist() {
  const tx = db.transaction("playlist", "readonly").objectStore("playlist");
  const req = tx.getAll();
  req.onsuccess = () => {
    const container = document.getElementById("playlist-list");
    container.innerHTML = "";
    req.result.forEach(file => {
      const div = document.createElement("div");
      div.className = "playlist-item";
      div.draggable = true;
      div.textContent = file.name;
      div.ondragstart = (e) => e.dataTransfer.setData("playlist", file.name);
      container.appendChild(div);
    });
  };
}

function playPlaylist() {
  const tx = db.transaction("playlist", "readonly").objectStore("playlist");
  const req = tx.getAll();
  req.onsuccess = async () => {
    for (const file of req.result) {
      localStorage.setItem("lastText", file.content);
      displayText(file.content);
      await new Promise(resolve => {
        let i = 0;
        const playSentence = () => {
          if (i >= sentences.length) return resolve();
          highlightSentence(i);
          const u = new SpeechSynthesisUtterance(sentences[i]);
          u.onend = () => { i++; playSentence(); };
          speechSynthesis.speak(u);
        };
        playSentence();
      });
    }
  };
}
