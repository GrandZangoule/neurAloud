let utterance;
let currentSentenceIndex = 0;
let sentences = [];

window.addEventListener("DOMContentLoaded", () => {
  const lastText = localStorage.getItem("lastText");
  if (lastText) {
    displayText(lastText);
  }
});

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
    stop();
    return;
  }

  const sentence = sentences[index];
  highlightSentence(index);

  utterance = new SpeechSynthesisUtterance(sentence);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

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

function navigate(tab) {
  alert(`🔧 Navigation to "${tab}" is not yet wired. Coming soon.`);
}

function translateText() {
  alert("🌍 Translation feature is coming soon!");
}
