let currentIndex = 0;
let sentences = [];
let utterance;
let currentFileName = '';
const queueList = document.getElementById("queue-list");
const textContainer = document.getElementById("text-container");

// Load from localStorage on startup
window.onload = function () {
  const storedText = localStorage.getItem("lastText");
  const storedFile = localStorage.getItem("lastFileName");
  if (storedText && storedFile) {
    document.getElementById("text-container").innerText = storedText;
    currentFileName = storedFile;
    addToQueue(currentFileName);
  }
};

function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentFileName = file.name;
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "txt") {
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      displayText(text);
    };
    reader.readAsText(file);
  } else if (extension === "pdf") {
    const reader = new FileReader();
    reader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(pdf => {
        let allText = '';
        let pagePromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pagePromises.push(
            pdf.getPage(i).then(page => {
              return page.getTextContent().then(textContent => {
                return textContent.items.map(item => item.str).join(' ');
              });
            })
          );
        }
        Promise.all(pagePromises).then(texts => {
          allText = texts.join('\n');
          displayText(allText);
        });
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Unsupported file type. Please upload .txt or .pdf only.");
  }
}

function displayText(text) {
  localStorage.setItem("lastText", text);
  localStorage.setItem("lastFileName", currentFileName);
  textContainer.innerText = text;
  addToQueue(currentFileName);
  prepareSentences(text);
}

function prepareSentences(text) {
  sentences = text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [];
  currentIndex = 0;
}

function addToQueue(filename) {
  const li = document.createElement("li");
  li.textContent = filename;
  queueList.appendChild(li);
}

function speakText() {
  if (currentIndex >= sentences.length) return;

  const text = sentences[currentIndex].trim();
  highlightSentence(currentIndex);

  utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = () => {
    currentIndex++;
    speakText();
  };
  speechSynthesis.speak(utterance);
}

function play() {
  if (!utterance || speechSynthesis.paused) {
    speechSynthesis.resume();
  } else {
    speakText();
  }
}

function pause() {
  speechSynthesis.pause();
}

function stop() {
  speechSynthesis.cancel();
  currentIndex = 0;
  clearHighlight();
}

function highlightSentence(index) {
  const highlighted = sentences.map((s, i) =>
    i === index ? `<span class="highlight">${s}</span>` : s
  );
  textContainer.innerHTML = highlighted.join(" ");
}

function clearHighlight() {
  textContainer.innerHTML = sentences.join(" ");
}
