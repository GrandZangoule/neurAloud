// script.js - NeurAloud full logic with PDF, highlighting, persistence

let uploadedText = "";
const textDisplay = document.getElementById("text-display");
const fileInput = document.getElementById("file-input");
const ttsEngine = document.getElementById("tts-engine");
let utterance;
let currentSentenceIndex = 0;
let sentenceList = [];

function splitTextToSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

function highlightSentence(index) {
  sentenceList = splitTextToSentences(uploadedText);
  const highlighted = sentenceList
    .map((s, i) => i === index ? `<mark>${s}</mark>` : s)
    .join(" ");
  textDisplay.innerHTML = highlighted;
}

function play() {
  if (!uploadedText) return;
  sentenceList = splitTextToSentences(uploadedText);
  if (currentSentenceIndex >= sentenceList.length) currentSentenceIndex = 0;

  utterance = new SpeechSynthesisUtterance(sentenceList[currentSentenceIndex]);
  utterance.onend = () => {
    currentSentenceIndex++;
    if (currentSentenceIndex < sentenceList.length) play();
  };
  highlightSentence(currentSentenceIndex);
  speechSynthesis.speak(utterance);
}

function pause() {
  speechSynthesis.pause();
}

function stop() {
  speechSynthesis.cancel();
  currentSentenceIndex = 0;
  highlightSentence(-1);
}

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();

  if (file.name.endsWith(".pdf")) {
    reader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      uploadedText = fullText;
      localStorage.setItem("neurAloudLastText", fullText);
      textDisplay.innerText = fullText;
    };
    reader.readAsArrayBuffer(file);
  } else {
    reader.onload = function () {
      uploadedText = reader.result;
      localStorage.setItem("neurAloudLastText", uploadedText);
      textDisplay.innerText = uploadedText;
    };
    reader.readAsText(file);
  }
});

// Restore previous session text
window.onload = () => {
  const savedText = localStorage.getItem("neurAloudLastText");
  if (savedText) {
    uploadedText = savedText;
    textDisplay.innerText = savedText;
  }
};
