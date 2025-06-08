let currentText = "";
let currentFile = null;
let utterance = null;
let synth = window.speechSynthesis;

const fileInput = document.getElementById("file-input");
const textDisplay = document.getElementById("text-display");
const fileNameDisplay = document.getElementById("file-name");
const libraryList = document.getElementById("library-list");

fileInput.addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  fileNameDisplay.textContent = file.name;
  currentFile = file;

  if (ext === "pdf") readPDF(file);
  else if (ext === "docx") readDOCX(file);
  else if (ext === "txt") readTXT(file);
  else {
    textDisplay.innerHTML = "Unsupported file format.";
  }

  saveToLibrary(file.name);
}

function readTXT(file) {
  const reader = new FileReader();
  reader.onload = () => {
    currentText = reader.result;
    textDisplay.textContent = currentText;
  };
  reader.readAsText(file);
}

function readDOCX(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    mammoth.convertToHtml({ arrayBuffer: event.target.result }).then((result) => {
      currentText = result.value.replace(/<[^>]+>/g, "");
      textDisplay.innerHTML = result.value;
    });
  };
  reader.readAsArrayBuffer(file);
}

function readPDF(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
    let fullText = "";
    textDisplay.innerHTML = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      textDisplay.appendChild(canvas);

      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + " ";
    }

    currentText = fullText;
  };
  reader.readAsArrayBuffer(file);
}

function play() {
  if (!currentText) return;

  stop();
  utterance = new SpeechSynthesisUtterance(currentText);

  utterance.rate = parseFloat(localStorage.getItem("neurAloudRate") || "1");
  utterance.pitch = parseFloat(localStorage.getItem("neurAloudPitch") || "1");

  const selectedEngine = document.getElementById("tts-engine").value;
  applyTTS(selectedEngine, utterance);
}

function applyTTS(engine, utterance) {
  switch (engine.toLowerCase()) {
    case "default":
      synth.speak(utterance);
      break;
    default:
      alert(`${engine} support will be added in premium version. Default voice used.`);
      synth.speak(utterance);
  }
}

function pause() {
  if (synth.speaking && !synth.paused) synth.pause();
}

function stop() {
  if (synth.speaking) synth.cancel();
}

document.getElementById("rate-slider").oninput = (e) => {
  const value = e.target.value;
  document.getElementById("rate-value").textContent = value;
  localStorage.setItem("neurAloudRate", value);
};

document.getElementById("pitch-slider").oninput = (e) => {
  const value = e.target.value;
  document.getElementById("pitch-value").textContent = value;
  localStorage.setItem("neurAloudPitch", value);
};

function loadSettings() {
  const savedRate = localStorage.getItem("neurAloudRate") || "1";
  const savedPitch = localStorage.getItem("neurAloudPitch") || "1";

  document.getElementById("rate-slider").value = savedRate;
  document.getElementById("rate-value").textContent = savedRate;

  document.getElementById("pitch-slider").value = savedPitch;
  document.getElementById("pitch-value").textContent = savedPitch;
}

function navigate(section) {
  document.querySelectorAll(".view-section").forEach(el => el.style.display = "none");
  const active = document.getElementById(section);
  if (active) active.style.display = "block";

  if (section === "library") showLibrary();
}

function saveToLibrary(filename) {
  let files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  if (!files.includes(filename)) {
    if (files.length >= 100) files.shift();
    files.push(filename);
    localStorage.setItem("neurAloudLibrary", JSON.stringify(files));
  }
}

function showLibrary() {
  let files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  libraryList.innerHTML = "";
  files.reverse().forEach(file => {
    const li = document.createElement("li");
    li.textContent = file;
    libraryList.appendChild(li);
  });
}

navigate("home");
loadSettings();
