let currentText = "";
let utterance = null;
let isPaused = false;
let currentIndex = 0;
let resumeState = {
  voice: '',
  rate: 1,
  index: 0,
  text: ''
};

// Load last session (auto-resume)
window.onload = () => {
  const saved = JSON.parse(localStorage.getItem('neurAloudState'));
  if (saved) {
    resumeState = saved;
    document.getElementById('tts-engine').value = saved.voice || 'Google TTS';
    currentText = saved.text;
    currentIndex = saved.index || 0;
  }
};

// Play TTS
function play() {
  if (!currentText) {
    alert("Please upload a .txt file to begin.");
    return;
  }

  if (isPaused && utterance) {
    speechSynthesis.resume();
    isPaused = false;
    return;
  }

  const engine = document.getElementById('tts-engine').value;
  const lines = currentText.split('\n').slice(currentIndex);
  const textToSpeak = lines.join(' ');

  utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = resumeState.rate || 1;
  utterance.lang = 'en-US';

  // Save current settings
  resumeState.voice = engine;
  resumeState.text = currentText;
  resumeState.index = currentIndex;
  localStorage.setItem('neurAloudState', JSON.stringify(resumeState));

  utterance.onend = () => {
    currentIndex = 0;
    isPaused = false;
    utterance = null;
  };

  speechSynthesis.speak(utterance);
}

// Pause TTS
function pause() {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    isPaused = true;
  }
}

// Stop TTS
function stop() {
  if (speechSynthesis.speaking || isPaused) {
    speechSynthesis.cancel();
    isPaused = false;
    currentIndex = 0;
    utterance = null;
  }
}

// Handle file upload
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("file-input");
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentText = event.target.result;
        currentIndex = 0;
        resumeState.text = currentText;
        localStorage.setItem('neurAloudState', JSON.stringify(resumeState));
        alert("File loaded successfully.");
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid .txt file.");
    }
  });
});
