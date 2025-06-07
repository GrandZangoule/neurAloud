let synth = window.speechSynthesis;
let sentences = [];
let currentIndex = 0;
let utterance = null;
let paused = false;

function navigate(page) {
  alert(`Navigating to ${page} (placeholder)`);
}

function play() {
  if (paused) {
    synth.resume();
    paused = false;
    return;
  }

  if (!sentences.length) {
    alert("No text loaded to read.");
    return;
  }

  if (synth.speaking) {
    synth.cancel();
  }

  readNextSentence();
}

function pause() {
  if (synth.speaking) {
    synth.pause();
    paused = true;
  }
}

function stop() {
  synth.cancel();
  currentIndex = 0;
  clearHighlights();
}

function clearHighlights() {
  document.querySelectorAll(".sentence").forEach(span => {
    span.classList.remove("highlighted");
  });
}

function readNextSentence() {
  if (currentIndex >= sentences.length) {
    currentIndex = 0;
    return;
  }

  clearHighlights();
  const span = sentences[currentIndex];
  span.classList.add("highlighted");

  utterance = new SpeechSynthesisUtterance(span.textContent);
  utterance.onend = () => {
    currentIndex++;
    readNextSentence();
  };

  synth.speak(utterance);
}

function translateText() {
  alert("🌍 Translate feature coming soon!");
}

// On DOM ready, restore last file
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("lastText");
  if (saved) {
    const paragraphs = saved.split(/(?<=\.|\!|\?)\s/).map(s => `<span class="sentence">${s}</span>`);
    document.getElementById("text-display").innerHTML = paragraphs.join(" ");
    sentences = Array.from(document.querySelectorAll(".sentence"));
  }
});

// Hook file parser for localStorage persistence
document.getElementById("file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file?.type === "text/plain") {
    const reader = new FileReader();
    reader.onload = function () {
      const text = reader.result;
      const parts = text.split(/(?<=\.|\!|\?)\s/);
      const html = parts.map(s => `<span class="sentence">${s}</span>`).join(" ");
      document.getElementById("text-display").innerHTML = html;
      sentences = Array.from(document.querySelectorAll(".sentence"));
      localStorage.setItem("lastText", text);
    };
    reader.readAsText(file);
  }
});
