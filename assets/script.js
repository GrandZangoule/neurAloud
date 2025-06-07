let currentText = "";
let currentUtterance = null;
let synth = window.speechSynthesis;

function navigate(section) {
  alert(`Navigation to "${section}" is not implemented yet.`);
}

document.getElementById("file-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("file-name").textContent = file.name;

  const reader = new FileReader();
  const isPDF = file.type === "application/pdf";

  if (isPDF) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      textContent += strings.join(" ") + "\n\n";
    }
    currentText = textContent;
    document.getElementById("text-display").textContent = textContent;
  } else {
    reader.onload = function () {
      currentText = reader.result;
      document.getElementById("text-display").textContent = currentText;
    };
    reader.readAsText(file);
  }
});

function play() {
  if (!currentText) return;
  stop(); // Stop any existing speech
  currentUtterance = new SpeechSynthesisUtterance(currentText);
  currentUtterance.onend = () => {
    console.log("Speech finished.");
  };
  synth.speak(currentUtterance);
}

function pause() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  }
}

function stop() {
  if (synth.speaking) {
    synth.cancel();
  }
}
