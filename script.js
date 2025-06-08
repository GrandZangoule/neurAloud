let utterance;
let currentSentenceIndex = 0;
let sentences = [];
let loop = false;

window.addEventListener("DOMContentLoaded", () => {
  const lastText = localStorage.getItem("lastText");
  if (lastText) displayText(lastText);
});

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  const ext = file.name.split('.').pop().toLowerCase();

  if (['txt', 'text', 'md', 'csv', 'sql'].includes(ext)) {
    reader.onload = () => {
      const text = reader.result;
      displayText(text);
      localStorage.setItem("lastText", text);
    };
    reader.readAsText(file);
  } else if (['pdf'].includes(ext)) {
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + "\n";
      }
      displayText(fullText);
      localStorage.setItem("lastText", fullText);
    };
    reader.readAsArrayBuffer(file);
  } else if (['docx'].includes(ext)) {
    reader.onload = (e) => {
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(result => {
          displayText(result.value);
          localStorage.setItem("lastText", result.value);
        });
    };
    reader.readAsArrayBuffer(file);
  } else if (['jpeg', 'jpg', 'png', 'webp', 'bmp'].includes(ext)) {
    reader.onload = () => {
      displayText(`📷 Image loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Unsupported format yet. Coming soon!");
  }
}

function displayText(text) {
  sentences = text.split(/(?<=[.?!])\s+/);
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
    if (loop) {
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
  loop = !loop;
  alert(`🔁 Looping is now ${loop ? "ON" : "OFF"}`);
}

function translateText() {
  alert("🌐 Translation feature is coming soon!");
}

function navigate(tab) {
  alert(`🔧 Navigation to "${tab}" is not yet wired. Coming soon.`);
}
