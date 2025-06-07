let uploadedFiles = JSON.parse(localStorage.getItem("neurAloudFiles")) || [];
let currentFile = null;
let speech = window.speechSynthesis;
let utterance = null;
let sentences = [];
let currentIndex = 0;

// Load selected file
document.getElementById("fileInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (uploadedFiles.length >= 100) {
    const proceed = confirm(
      "📁 You’ve reached 100 files. Replace the oldest one?"
    );
    if (!proceed) return;
    uploadedFiles.shift();
  }

  currentFile = file.name;
  uploadedFiles.push(currentFile);
  localStorage.setItem("neurAloudFiles", JSON.stringify(uploadedFiles));

  await loadAndDisplayFile(file);
  updateReadQueue();
});

// Load and display file content
async function loadAndDisplayFile(file) {
  const reader = new FileReader();

  if (file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + " ";
    }
    showText(text);
  } else {
    reader.onload = () => {
      showText(reader.result);
    };
    reader.readAsText(file);
  }
}

// Display text in the preview box
function showText(text) {
  const box = document.getElementById("textBox");
  box.innerHTML = "";
  sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  sentences.forEach((s, i) => {
    const span = document.createElement("span");
    span.textContent = s.trim() + " ";
    span.id = `sentence-${i}`;
    box.appendChild(span);
  });
  currentIndex = 0;
}

// Highlight current sentence
function highlightSentence(index) {
  sentences.forEach((_, i) => {
    const el = document.getElementById(`sentence-${i}`);
    if (el) el.classList.remove("highlight");
  });
  const active = document.getElementById(`sentence-${index}`);
  if (active) {
    active.classList.add("highlight");
    active.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Play button
function play() {
  if (speech.speaking) return;
  speakFrom(currentIndex);
}

// Speak logic
function speakFrom(index) {
  if (index >= sentences.length) return stop();

  utterance = new SpeechSynthesisUtterance(sentences[index]);
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onstart = () => {
    highlightSentence(index);
  };

  utterance.onend = () => {
    currentIndex++;
    speakFrom(currentIndex);
  };

  speech.speak(utterance);
}

// Pause
function pause() {
  speech.pause();
}

// Stop
function stop() {
  speech.cancel();
  currentIndex = 0;
  highlightSentence(-1);
}

// Read Queue UI
function updateReadQueue() {
  const ul = document.getElementById("queue-list");
  ul.innerHTML = "";
  uploadedFiles.slice().reverse().forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    ul.appendChild(li);
  });
}

// Load saved files
window.onload = () => {
  updateReadQueue();
};
