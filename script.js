let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let capturedText = '';
let db;


window.addEventListener("DOMContentLoaded", async () => {
  try { await initDB(); } catch (e) { console.error("initDB failed:", e); }
  try { loadSettings(); } catch (e) { console.error("loadSettings failed:", e); }
  try { restoreLastFile(); } catch (e) { console.error("restoreLastFile failed:", e); }
  try { loadTTSEngines("listen"); } catch (e) { console.error("TTS listen engine failed:", e); }
  try { loadTTSEngines("capture"); } catch (e) { console.error("TTS capture engine failed:", e); }
  try { restoreSection(); } catch (e) { console.error("restoreSection failed:", e); }
  try { restoreLibraryItems("listen"); } catch (e) { console.error("restore listen library failed:", e); }
  try { restoreLibraryItems("capture"); } catch (e) { console.error("restore capture library failed:", e); }
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
      let saved = JSON.parse(localStorage.getItem(type + "-library") || "[]");
      saved = saved.filter(entry => entry.name !== name);
      localStorage.setItem(type + "-library", JSON.stringify(saved));
    }
  };
  item.appendChild(del);
  list.appendChild(item);

  let saved = JSON.parse(localStorage.getItem(type + "-library") || "[]");
  saved.push({ name, content });
  localStorage.setItem(type + "-library", JSON.stringify(saved));
}

function restoreLibraryItems(type) {
  const list = document.getElementById(type === "listen" ? "listen-library-list" : "capture-library-list");
  const saved = JSON.parse(localStorage.getItem(type + "-library") || "[]");
  saved.forEach(({ name, content }) => {
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
        let updated = JSON.parse(localStorage.getItem(type + "-library") || "[]");
        updated = updated.filter(entry => entry.name !== name);
        localStorage.setItem(type + "-library", JSON.stringify(updated));
      }
    };
    item.appendChild(del);
    list.appendChild(item);
  });
}

function loadFile(event) {
  alert('📁 Starting to load file...');
  const file = event.target.files[0];
  if (!file) return;
  localStorage.setItem("lastFileName", file.name);
  const reader = new FileReader();
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    // alert('📥 Reading PDF data...');
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      localStorage.setItem("lastPDFData", JSON.stringify(Array.from(typedArray)));
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      const container = document.getElementById("text-display");
      container.innerHTML = "";
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        // alert(`📄 Rendering page ${i}...`);
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
      localStorage.setItem("lastFileType", "pdf");
      sentences = text.split(/(?<=[.?!])\s+/);
      displayText(sentences);
    };
    alert('✅ PDF reading initiated.');
    reader.readAsArrayBuffer(file);
  }
}

function restoreLastFile() {
  // alert('🔄 Attempting to restore last loaded file...');
  const type = localStorage.getItem("lastFileType");
  const name = localStorage.getItem("lastPDFFileName");

  if (type === "pdf" && name) {
    getPDFBufferFromDB(name).then(async (buffer) => {
      if (!buffer || buffer.byteLength === 0) {
        alert("❌ No valid PDF buffer found in IndexedDB. Skipping restore.");
        return;
      }

      console.log("📦 Loaded buffer from IndexedDB:", buffer);
      const sizeKB = (buffer.byteLength / 1024).toFixed(2);
      try {
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        alert(`📘 PDF file found (${sizeKB} KB). Loading...`);
        const container = document.getElementById("text-display");
        container.innerHTML = "";
        let pagesRendered = 0;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.style.display = "block";
          canvas.style.margin = "20px auto";
          canvas.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          container.appendChild(canvas);
          pagesRendered++;
        }

        if (pagesRendered === 0) {
          alert("⚠️ No pages rendered. Skipping restore.");
          return;
        }

        const last = localStorage.getItem("lastText");
        if (last) {
          sentences = last.split(/(?<=[.?!])\s+/);
          displayText(sentences);
        }
        alert("✅ PDF restored and displayed.");
      } catch (err) {
        alert("❌ Failed to load PDF from buffer: " + err.message);
        const tx = db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        store.delete(name);
        console.warn("🧹 Removed corrupted PDF buffer:", name);
      }
    });
  } else {
    alert("ℹ️ No PDF restore conditions met.");
  }
}

function displayText(sentencesArr) {
  const html = sentencesArr.map((s, i) => `<span class="sentence" data-index="${i}">${s}</span>`).join(" ");
  document.getElementById("text-display").innerHTML += html;
}

function highlightSentence(index) {
  const el = document.querySelector(`.sentence[data-index="${index}"]`);
  if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
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

function stop() {
  speechSynthesis.cancel();
  currentSentenceIndex = 0;
  highlightSentence(-1);
}

function pause() {
  if (speechSynthesis.speaking) speechSynthesis.pause();
}

function toggleLoop() {
  isLooping = !isLooping;
  alert("Loop is now " + (isLooping ? "enabled" : "disabled"));
}

function loadToPlaylist() {
  const text = localStorage.getItem("lastText");
  const name = prompt("Name for playlist item:", localStorage.getItem("lastFileName") || "untitled");
  if (!text || !name) return;
  const playlist = document.getElementById("playlist");
  const item = document.createElement("div");
  item.className = "playlist-item";
  item.textContent = name;
  item.onclick = () => {
    sentences = text.split(/(?<=[.?!])\s+/);
    displayText(sentences);
  };
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "−";
  removeBtn.onclick = () => playlist.removeChild(item);
  item.appendChild(removeBtn);
  playlist.appendChild(item);
}

document.addEventListener("DOMContentLoaded", () => {
  const playlist = document.getElementById("playlist");
  playlist.ondragover = (e) => e.preventDefault();
  playlist.ondrop = (e) => {
    e.preventDefault();
    const { name, content } = JSON.parse(e.dataTransfer.getData("text/plain"));
    const item = document.createElement("div");
    item.className = "playlist-item";
    item.textContent = name;
    item.onclick = () => {
      localStorage.setItem("lastText", content);
      sentences = content.split(/(?<=[.?!])\s+/);
      displayText(sentences);
    };
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "−";
    removeBtn.onclick = () => playlist.removeChild(item);
    item.appendChild(removeBtn);
    playlist.appendChild(item);
  };
});

function loadSettings() {
  document.getElementById("rate").value = localStorage.getItem("rate") || 1;
  document.getElementById("pitch").value = localStorage.getItem("pitch") || 1;
  document.getElementById("capture-rate").value = localStorage.getItem("capture-rate") || 1;
  document.getElementById("capture-pitch").value = localStorage.getItem("capture-pitch") || 1;
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

function loadTTSEngines(section) {
  const engines = ["default", "google", "ibm", "responsivevoice"];
  const select = document.getElementById(section === "listen" ? "tts-engine" : "capture-tts-engine");
  select.innerHTML = "";
  engines.forEach(engine => {
    const opt = document.createElement("option");
    opt.value = engine;
    opt.textContent = engine.toUpperCase();
    select.appendChild(opt);
  });
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

function playCaptured() {
  const voice = document.getElementById("capture-voice-select").value;
  const tts = new SpeechSynthesisUtterance(capturedText);
  tts.voice = speechSynthesis.getVoices().find(v => v.name === voice);
  tts.rate = parseFloat(document.getElementById("capture-rate").value);
  tts.pitch = parseFloat(document.getElementById("capture-pitch").value);
  speechSynthesis.speak(tts);
}

function startCapture() {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = document.getElementById("capture-lang-in").value;
  recognition.continuous = true;
  recognition.onresult = (e) => {
    capturedText = Array.from(e.results).map(r => r[0].transcript).join(" ");
    document.getElementById("capture-display").innerText = capturedText;
  };
  recognition.start();
}

function translateText() {
  alert("🌍 Translation coming soon!");
}

// ✅ Enhanced PDF Storage and Reload with IndexedDB
async function savePDFToDB(name, buffer) {
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");
  await store.put({ id: name, buffer });
}

async function getPDFBufferFromDB(name) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const request = store.get(name);
    request.onsuccess = () => resolve(request.result?.buffer || null);
    request.onerror = () => reject(null);
  });
}

// Override loadFile for PDF using IndexedDB
function loadFile(event) {
  alert('📁 Starting to load file...');
  const file = event.target.files[0];
  if (!file) return;
  localStorage.setItem("lastFileName", file.name);
  const reader = new FileReader();
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") {
    alert('📥 Reading PDF data...');
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      alert('💾 Saving PDF to IndexedDB...');
      await savePDFToDB(file.name, typedArray);
      localStorage.setItem("lastFileType", "pdf");
      localStorage.setItem("lastPDFFileName", file.name);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      const container = document.getElementById("text-display");
      container.innerHTML = "";
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        alert(`📄 Rendering page ${i}...`);
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
      displayText(sentences);
    };
    alert('✅ PDF reading initiated.');
    reader.readAsArrayBuffer(file);
  }
}

// Override restoreLastFile using IndexedDB
function restoreLastFile() {
  alert('🔄 Attempting to restore last loaded file...');
  const type = localStorage.getItem("lastFileType");
  const name = localStorage.getItem("lastPDFFileName");
    if (type === "pdf" && name) {
  getPDFBufferFromDB(name).then(async (buffer) => {
    if (!buffer || buffer.byteLength === 0) {
      alert("❌ No valid PDF buffer to load.");
      return;
    }

    const sizeKB = (buffer.byteLength / 1024).toFixed(2);
    alert(`📘 PDF file found (${sizeKB} KB). Loading...`);

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const container = document.getElementById("text-display");
    container.innerHTML = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        alert(`🖼️ Rendering stored PDF page ${i}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
        container.appendChild(canvas);
      }
    });
  }

  const last = localStorage.getItem("lastText");
  if (last) {
    sentences = last.split(/(?<=[.?!])\s+/);
  alert('✅ Text loaded and displayed.');
    displayText(sentences);
  }
}
