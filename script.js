let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let isLooping = false;

window.addEventListener("DOMContentLoaded", () => {
  const lastText = localStorage.getItem("lastText");
  if (lastText) {
    displayText(lastText);
  }
});

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
  } else if (ext === "pdf") {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const typedarray = new Uint8Array(fileReader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      localStorage.setItem("lastText", text);
      displayText(text);
    };
    fileReader.readAsArrayBuffer(file);
  } else if (ext === "docx") {
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      const result = await mammoth.convertToText({ arrayBuffer });
      const text = result.value;
      localStorage.setItem("lastText", text);
      displayText(text);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file format for now.");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=\.|\!|\?)\s/);
  const html = sentences.map((s, i) =>
    `<span class="sentence" onclick="jumpTo(${i})">${s}</span>`
  ).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
    if (i === index) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
  alert("Selected TTS engine: " + engine + " (Only default supported for now)");
}

function navigate(tab) {
  alert(`🔧 Navigation to "${tab}" is not yet wired. Coming soon.`);
}

function translateText() {
  alert("🌍 Translation feature is coming soon!");
}
