let currentText = '';
let sentences = [];
let currentSentence = 0;
let utterance;
let synth = window.speechSynthesis;
let queue = [];
let selectedVoice = null;

// DOM elements
const fileInput = document.getElementById('fileInput');
const loadFileBtn = document.getElementById('loadFileBtn');
const textDisplay = document.getElementById('textDisplay');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const queueList = document.getElementById('queueList');
const ttsEngine = document.getElementById('ttsEngine');

// Load persisted file (if any)
window.addEventListener('DOMContentLoaded', () => {
  const last = localStorage.getItem('neurAloud_lastText');
  if (last) {
    loadText(last);
  }
  populateVoices();
});

// Update voices when loaded
function populateVoices() {
  const voices = synth.getVoices();
  if (!voices.length) {
    setTimeout(populateVoices, 100);
    return;
  }
  voices.forEach(v => {
    const opt = document.createElement('option');
    opt.textContent = `${v.name} (${v.lang})`;
    opt.value = v.name;
    ttsEngine.appendChild(opt);
  });
}

// File loader
loadFileBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return alert("No file selected");

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['txt', 'pdf'].includes(ext)) {
    alert("Only .txt and .pdf files are supported.");
    return;
  }

  let text = '';
  if (ext === 'txt') {
    text = await file.text();
  } else {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(x => x.str).join(' ') + '\n';
    }
  }

  // Save and render
  localStorage.setItem('neurAloud_lastText', text);
  loadText(text);
});

// Load text into viewer
function loadText(text) {
  currentText = text;
  sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  currentSentence = 0;
  renderText();
  renderQueue();
}

// Render full text with highlight
function renderText() {
  const html = sentences.map((s, i) =>
    `<span class="${i === currentSentence ? 'highlight' : ''}">${s.trim()} </span>`).join('');
  textDisplay.innerHTML = html;
}

// Render read queue
function renderQueue() {
  queueList.innerHTML = '';
  queue.push(currentText);
  queue.slice(-10).forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = `File ${queue.length - 10 + i + 1}`;
    queueList.appendChild(li);
  });
}

// TTS Functions
playBtn.addEventListener('click', () => {
  if (synth.speaking) return;
  speakSentence(currentSentence);
});

pauseBtn.addEventListener('click', () => {
  if (synth.speaking) synth.pause();
  else synth.resume();
});

stopBtn.addEventListener('click', () => {
  synth.cancel();
  currentSentence = 0;
  renderText();
});

function speakSentence(index) {
  if (index >= sentences.length) return;
  utterance = new SpeechSynthesisUtterance(sentences[index]);
  utterance.voice = synth.getVoices().find(v => v.name === ttsEngine.value) || null;
  utterance.onend = () => {
    currentSentence++;
    renderText();
    speakSentence(currentSentence);
  };
  synth.speak(utterance);
}
