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

  reader.onload = function (e) {
    const content = e.target.result;
    localStorage.setItem("lastText", content);
    displayText(content);
  };

  if (file.type === "application/pdf") {
    alert("PDF support will be integrated soon. For now, use .txt files.");
  } else {
    reader.readAsText(file);
  }
}

function displayText(text) {
  sentences = text.split(/(?<=\.|\!|\?)\s/);
  const html = sentences.map(s => `<span class="sentence">${s}</span>`).join(" ");
  document.getElementById("text-display").innerHTML = html;
}

function highlightSentence(index) {
  document.querySelectorAll(".sentence").forEach((el, i) => {
    el.classList.toggle("highlight", i === index);
  });
}

function play() {
  if (!sentences.length) {
    alert("Please load a document first.");
    return;
  }

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
      speakSentence(currentSentenceIndex);
    } else {
      stop();
    }
    return;
  }

  const sentence = sentences[index];
  highlightSentence(index);

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
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

function stop() {
  speechSynthesis.cancel();
  currentSentenceIndex = 0;
  highlightSentence(-1);
}

function toggleLoop() {
  isLooping = !isLooping;
  alert("🔁 Looping " + (isLooping ? "enabled" : "disabled"));
}

function navigate(tab) {
  alert(`🔧 Navigation to "${tab}" coming soon.`);
}

function translateText() {
  alert("🌐 Translation support coming soon!");
}
