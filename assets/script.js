let currentText = '';
let utterance;
let synth = window.speechSynthesis;
let isPaused = false;

document.getElementById('file-input').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const display = document.getElementById('text-display');

  if (file.type === 'application/pdf') {
    const reader = new FileReader();
    reader.onload = function () {
      const typedarray = new Uint8Array(reader.result);
      pdfjsLib.getDocument(typedarray).promise.then(pdf => {
        let text = '';
        let pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pages.push(pdf.getPage(i).then(page =>
            page.getTextContent().then(content => {
              return content.items.map(item => item.str).join(' ');
            })
          ));
        }

        Promise.all(pages).then(results => {
          text = results.join('\n\n');
          currentText = text;
          display.textContent = text;
        });
      });
    };
    reader.readAsArrayBuffer(file);
  } else {
    const reader = new FileReader();
    reader.onload = function () {
      currentText = reader.result;
      display.textContent = currentText;
    };
    reader.readAsText(file);
  }
}

function play() {
  if (isPaused) {
    synth.resume();
    isPaused = false;
    return;
  }

  if (synth.speaking) {
    stop();
  }

  utterance = new SpeechSynthesisUtterance(currentText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  synth.speak(utterance);
}

function pause() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
    isPaused = true;
  }
}

function stop() {
  synth.cancel();
  isPaused = false;
}
