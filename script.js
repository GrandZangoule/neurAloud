let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let activeTab = localStorage.getItem("activeTab") || "home";
let pdfDoc = null, currentFile = null, canvas = null, ctx = null;
let extractedText = "";
let voices = [];
let captureChunks = [];
let captureText = "";

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  showTab(activeTab);
  canvas = document.getElementById("pdf-canvas");
  ctx = canvas.getContext("2d");

  loadSettings();
  populateTTSEngines();
  populateVoices();

  const storedFile = localStorage.getItem("loadedFile");
  if (storedFile) {
    currentFile = JSON.parse(storedFile);
    if (currentFile.type === "pdf") loadPDF(currentFile.buffer);
    else displayText(currentFile.text);
  }
});

function showTab(tab) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  document.getElementById(tab).classList.add("active-section");
  localStorage.setItem("activeTab", tab);
}

function navigate(tab) {
  showTab(tab);
}

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  currentFile = { name: file.name };

  const reader = new FileReader();
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === "pdf") {
    reader.onload = () => {
      const arrayBuffer = reader.result;
      currentFile.type = "pdf";
      currentFile.buffer = arrayBuffer;
      localStorage.setItem("loadedFile", JSON.stringify(currentFile));
      loadPDF(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = () => {
      const text = reader.result;
      currentFile.type = "text";
      currentFile.text = text;
      localStorage.setItem("loadedFile", JSON.stringify(currentFile));
      displayText(text);
    };
    reader.readAsText(file);
  }
}

async function loadPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(1);

  const viewport = page.getViewport({ scale: 1.5 });
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  const content = await page.getTextContent();
  extractedText = content.items.map(item => item.str).join(" ");
  sentences = extractedText.split(/(?<=[.?!])\s+/);
}

function displayText(text) {
  sentences = text.split(/(?<=[.?!])\s+/);
  const html = sentences.map((s, i) =>
    `<span class="sentence" onclick="jumpTo(${i})">${s}</span>`
  ).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
    if (i === index) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function play() {
  if (!sentences.length) return alert("Please load a document.");
  const rate = parseFloat(document.getElementById("rate").value);
  const pitch = parseFloat(document.getElementById("pitch").value);

  if (utterance && speechSynthesis.paused) {
    speechSynthesis.resume();
    return;
  }
  speakSentence(currentSentenceIndex, rate, pitch);
}

function speakSentence(index, rate, pitch) {
  if (index >= sentences.length) {
    if (isLooping) {
      currentSentenceIndex = 0;
    } else {
      stop();
      return;
    }
  }

  highlightSentence(index);
  utterance = new SpeechSynthesisUtterance(sentences[index]);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.voice = speechSynthesis.getVoices().find(v => v.name === document.getElementById("voice-select").value);

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

function jumpTo(index) {
  stop();
  currentSentenceIndex = index;
  play();
}

function toggleLoop() {
  isLooping = !isLooping;
  alert("Loop is now " + (isLooping ? "enabled" : "disabled"));
}

function saveToLibrary(tab) {
  const name = prompt("Save file as:", currentFile?.name || "Untitled");
  if (!name) return;
  const key = tab === "capture" ? "capture-library" : "listen-library";
  let library = JSON.parse(localStorage.getItem(key) || "[]");
  if (library.length >= 100) library.shift();
  library.push({ name, content: tab === "capture" ? captureText : extractedText });
  localStorage.setItem(key, JSON.stringify(library));
  alert("Saved to library.");
}

function loadSettings() {
  document.getElementById("rate").value = localStorage.getItem("rate") || "1";
  document.getElementById("pitch").value = localStorage.getItem("pitch") || "1";
  document.getElementById("rateVal").innerText = document.getElementById("rate").value;
  document.getElementById("pitchVal").innerText = document.getElementById("pitch").value;
}

document.getElementById("rate").oninput = (e) => {
  localStorage.setItem("rate", e.target.value);
  document.getElementById("rateVal").innerText = e.target.value;
};

document.getElementById("pitch").oninput = (e) => {
  localStorage.setItem("pitch", e.target.value);
  document.getElementById("pitchVal").innerText = e.target.value;
};

function changeTTSEngine(context) {
  const engine = document.getElementById(context === "listen" ? "tts-engine" : "capture-tts-engine").value;
  localStorage.setItem(`${context}-engine`, engine);
  populateVoices();
}

function changeVoice(context) {
  const voice = document.getElementById(context === "listen" ? "voice-select" : "capture-voice-select").value;
  localStorage.setItem(`${context}-voice`, voice);
}

function populateTTSEngines() {
  const engines = ["Google", "IBM", "ResponsiveVoice"];
  const listen = document.getElementById("tts-engine");
  const capture = document.getElementById("capture-tts-engine");
  engines.forEach(engine => {
    listen.innerHTML += `<option value="${engine}">${engine}</option>`;
    capture.innerHTML += `<option value="${engine}">${engine}</option>`;
  });
}

function populateVoices() {
  voices = speechSynthesis.getVoices();
  const list = voices.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join('');
  document.getElementById("voice-select").innerHTML = `<option disabled>──────────────</option>${list}`;
  document.getElementById("capture-voice-select").innerHTML = `<option disabled>──────────────</option>${list}`;
}

speechSynthesis.onvoiceschanged = populateVoices;

function translateText() {
  alert("🌍 Translate coming soon.");
}

// Capture
function startCapture() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const recorder = new MediaRecorder(stream);
    captureChunks = [];
    recorder.ondataavailable = e => captureChunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(captureChunks, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.onload = () => {
        captureText = "[captured text placeholder from audio]"; // Replace with STT logic
        document.getElementById("capture-display").innerText = captureText;
      };
      reader.readAsText(blob);
    };
    recorder.start();
    setTimeout(() => recorder.stop(), 5000); // Record for 5 seconds
  });
}

function playCaptured() {
  if (!captureText) return;
  const utter = new SpeechSynthesisUtterance(captureText);
  utter.rate = parseFloat(document.getElementById("capture-rate").value);
  utter.pitch = parseFloat(document.getElementById("capture-pitch").value);
  speechSynthesis.speak(utter);
}
