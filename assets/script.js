const fileInput = document.getElementById("file-input");
const textDisplay = document.getElementById("text-display");

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(" ") + "\n\n";
    }
    textDisplay.textContent = fullText;
  } else {
    reader.onload = () => {
      textDisplay.textContent = reader.result;
    };
    reader.readAsText(file);
  }
});

function play() {
  const text = textDisplay.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

function pause() {
  speechSynthesis.pause();
}

function stop() {
  speechSynthesis.cancel();
}

function navigate(section) {
  alert(`Navigation to: ${section} — coming soon.`);
}
