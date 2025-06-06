let uploadedFiles = JSON.parse(localStorage.getItem("uploadedFiles")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let queue = [];

function updateQueueList() {
  const list = document.getElementById("queue-list");
  list.innerHTML = "";
  queue.forEach((file, idx) => {
    const li = document.createElement("li");
    li.textContent = file.name;
    if (favorites.includes(file.name)) {
      li.style.color = "gold";
    }
    li.onclick = () => playFile(file);
    list.appendChild(li);
  });
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedFiles.push({ name: file.name, type: file.type });
    queue.push(file);
    localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
    updateQueueList();
  }
}

function restoreQueueFromStorage() {
  uploadedFiles.forEach(file => {
    queue.push(file);
  });
  updateQueueList();
}

function playFile(file) {
  alert(`🔊 Now reading: ${file.name}`);
  // TTS engine would be invoked here
}

function play() {
  if (queue.length > 0) {
    playFile(queue[0]);
  } else {
    alert("Queue is empty. Please upload a file.");
  }
}

function pause() {
  alert("⏸️ Playback paused.");
}

function stop() {
  alert("⏹️ Playback stopped.");
}

document.addEventListener("DOMContentLoaded", () => {
  // Restore files on page reload
  restoreQueueFromStorage();

  // Create file input dynamically
  const uploadSection = document.getElementById("tts-panel");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".txt,.pdf,.docx,.epub";
  fileInput.addEventListener("change", handleFileUpload);
  uploadSection.appendChild(fileInput);

  // Sidebar navigation
  document.querySelectorAll(".nav-button").forEach(button => {
    button.addEventListener("click", () => {
      alert(`🚧 ${button.textContent.trim()} is under development.`);
    });
  });
});
