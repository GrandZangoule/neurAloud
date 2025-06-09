let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;
let currentFile = null;

document.addEventListener("DOMContentLoaded", () => {
  loadPreferences();
  navigate(localStorage.getItem("lastSection") || "home");
  const savedText = localStorage.getItem("lastText");
  if (savedText) displayText(savedText);
});

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentFile = file;
  localStorage.setItem("lastFilename", file.name);
  const ext = file.name.split('.').pop().toLowerCase();

  const reader = new FileReader();
  if (ext === "pdf") {
    reader.onload = () => {
      const typedarray = new Uint8Array(reader.result);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
        localStorage.setItem("pdfPages", pdf.numPages);
        pdf.getPage(1).then(page => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.id = "pdf-canvas";
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          page.render({ canvasContext: context, viewport });
          document.getElementById("text-display").innerHTML = "";
          document.getElementById("text-display").appendChild(canvas);
        });

        let text = "";
        const loadAllPages = async () => {
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(" ") + "\n";
          }
          localStorage.setItem("lastText", text);
          sentences = text.split(/(?<=[.?!])\s+/);
        };
        loadAllPages();
      });
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === "txt") {
    reader.onload = () => {
      const text = reader.result;
      localStorage.setItem("lastText", text);
      displayText(text);
    };
    reader.readAsText(file);
  } else {
    alert("Unsupported file type.");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=[.?!])\s+/);
  const html = sentences.map((s, i) => `<span class="sentence" data-index="${i}">${s}</span>`).join(" ");
  const container = document.getElementById("text-display");
  container.innerHTML = html;
}

function highlightSentence(index) {
  const all = document.querySelectorAll(".sentence");
  all.forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
    if (i === index) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

function play() {
  if (!sentences.length) return alert("Please load a file.");
  if (utterance && speechSynthesis.paused) {
    speechSynthesis.resume();
    return;
  }
  speakSentence(currentSentenceIndex);
}

function speakSentence(index) {
  if (index >= sentences.length) {
    if (isLooping) {
      currentSentenceIndex = 0;
    } else {
      stop();
      return;
    }
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

function translateText() {
  alert("🌍 Translation is coming soon!");
}

function navigate(section) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active-section"));
  const active = document.getElementById(section);
  if (active) active.classList.add("active-section");
  localStorage.setItem("lastSection", section);
}

function saveToLibrary(context) {
  const name = prompt("Save file as:", localStorage.getItem("lastFilename") || "unnamed.txt");
  if (!name) return;
  const libKey = context === "capture" ? "captureLibrary" : "listenLibrary";
  const data = JSON.parse(localStorage.getItem(libKey) || "[]");
  const entry = { name, text: localStorage.getItem("lastText") || "" };
  data.unshift(entry);
  localStorage.setItem(libKey, JSON.stringify(data.slice(0, 100)));
  alert("Saved to Library.");
}

function changeTTSEngine(context) {
  const engine = document.getElementById(context === "capture" ? "capture-tts-engine" : "tts-engine").value;
  localStorage.setItem(context + "Engine", engine);
  updateVoiceList(context);
}

function changeVoice(context) {
  const voice = document.getElementById(context === "capture" ? "capture-voice-select" : "voice-select").value;
  localStorage.setItem(context + "Voice", voice);
}

function loadPreferences() {
  ["tts-engine", "capture-tts-engine"].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = `
      <option value="google">Google TTS</option>
      <option value="ibm">IBM Watson</option>
      <option value="responsivevoice">ResponsiveVoice</option>
    `;
    const engine = localStorage.getItem(id.replace("-", ""));
    if (engine) sel.value = engine;
  });

  document.getElementById("rate").value = localStorage.getItem("rate") || 1;
  document.getElementById("pitch").value = localStorage.getItem("pitch") || 1;
  document.getElementById("rateVal").textContent = document.getElementById("rate").value;
  document.getElementById("pitchVal").textContent = document.getElementById("pitch").value;
}

document.getElementById("rate").oninput = function () {
  document.getElementById("rateVal").textContent = this.value;
  localStorage.setItem("rate", this.value);
};

document.getElementById("pitch").oninput = function () {
  document.getElementById("pitchVal").textContent = this.value;
  localStorage.setItem("pitch", this.value);
};
