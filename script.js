let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;

window.addEventListener("DOMContentLoaded", () => {
  const lastText = localStorage.getItem("lastText");
  const lastType = localStorage.getItem("lastFileType");
  const lastPitch = localStorage.getItem("lastPitch");
  const lastRate = localStorage.getItem("lastRate");
  const lastIndex = parseInt(localStorage.getItem("lastSentenceIndex") || "0", 10);
  const autoResume = localStorage.getItem("autoResume") === "true";

  if (lastPitch) {
    document.getElementById("pitch").value = lastPitch;
    document.getElementById("pitchVal").textContent = parseFloat(lastPitch).toFixed(2);
  }

  if (lastRate) {
    document.getElementById("rate").value = lastRate;
    document.getElementById("rateVal").textContent = parseFloat(lastRate).toFixed(2);
  }

  document.getElementById("auto-resume-toggle").checked = autoResume;

  if (lastText && lastType === "text") {
    displayText(lastText);
    currentSentenceIndex = lastIndex;
    if (autoResume) play();
  }

  loadVoices();
});

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
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        await page.render({ canvasContext: context, viewport }).promise;
        container.appendChild(canvas);

        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ") + " ";
      }

      localStorage.setItem("lastText", fullText.trim());
      localStorage.setItem("lastFileType", "text");
      sentences = fullText.trim().split(/(?<=\\.|!|\\?)\\s/);
    };
    fileReader.readAsArrayBuffer(file);
  } else if (ext === "docx") {
    const container = document.getElementById("text-display");
    container.innerHTML = "";
    renderDocx(file, container);
    localStorage.removeItem("lastText");
    sentences = [];
  } else {
    alert("Unsupported file format.");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=\\.|!|\\?)\\s/);
  const html = sentences.map((s, i) =>
    `<span class="sentence" onclick="jumpTo(${i})">${s}</span>`
  ).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  localStorage.setItem("lastSentenceIndex", index);
  document.querySelectorAll(".sentence").forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
    if (i === index) {
      const container = document.getElementById("text-display");
      const topOffset = el.offsetTop - container.offsetTop;
      const scrollTarget = topOffset - container.clientHeight * 0.2;
      container.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
  });
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
  alert("Loop is now " + (isLooping ? "enabled" : "disabled"));
}

function changeTTSEngine() {
  const engine = document.getElementById("tts-engine").value;
  alert("Selected TTS engine: " + engine);
}

function toggleAutoResume() {
  const checked = document.getElementById("auto-resume-toggle").checked;
  localStorage.setItem("autoResume", checked);
}

function translateText() {
  alert("🌍 Translation feature coming soon!");
}

function navigate(tab) {
  alert(`🔧 Navigation to "${tab}" is not yet implemented.`);
}

function loadVoices() {
  const voiceSelect = document.getElementById("voice-select");
  voiceSelect.innerHTML = "";
  const voices = speechSynthesis.getVoices();
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = voice.name + " (" + voice.lang + ")";
    voiceSelect.appendChild(option);
  });
}

speechSynthesis.onvoiceschanged = loadVoices;

function resetZoom() {
  const display = document.getElementById("text-display");
  display.style.transform = "scale(1)";
  display.scrollTo({ top: 0, behavior: "smooth" });
}
