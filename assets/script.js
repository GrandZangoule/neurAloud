let text = '';
let utterance = null;

document.getElementById("file-input").addEventListener("change", handleFile);

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  if (file.type === "application/pdf") {
    const fileReader = new FileReader();
    fileReader.onload = function () {
      const typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument(typedarray).promise.then(pdf => {
        let allText = '';
        const readPage = (pageNum) => {
          if (pageNum > pdf.numPages) {
            document.getElementById("text-display").textContent = allText;
            localStorage.setItem('neurAloud_text', allText);
            return;
          }
          pdf.getPage(pageNum).then(page => {
            page.getTextContent().then(content => {
              const strings = content.items.map(item => item.str).join(' ');
              allText += strings + '\n';
              readPage(pageNum + 1);
            });
          });
        };
        readPage(1);
      });
    };
    fileReader.readAsArrayBuffer(file);
  } else if (file.type === "text/plain") {
    reader.onload = function () {
      text = reader.result;
      document.getElementById("text-display").textContent = text;
      localStorage.setItem('neurAloud_text', text);
    };
    reader.readAsText(file);
  } else {
    alert("Unsupported file type. Please upload a .txt or .pdf file.");
  }
}

function play() {
  stop(); // stop previous utterance
  text = document.getElementById("text-display").textContent;
  if (!text) return;
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  speechSynthesis.speak(utterance);
}

function pause() {
  speechSynthesis.pause();
}

function stop() {
  speechSynthesis.cancel();
}

function navigate(section) {
  alert(`Navigating to ${section}... (Not yet implemented)`);
}

// Auto-load persisted file
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem('neurAloud_text');
  if (saved) {
    document.getElementById("text-display").textContent = saved;
  }
});
