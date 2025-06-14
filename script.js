// 🧩 Module 1: File Load, Text Extraction, and Metadata Setup (Enhanced)

// Element bindings
const fileInput = document.getElementById("file-input");
const textDisplay = document.getElementById("text-display");
const logArea = document.getElementById("log-area");
let extractedText = "";
let sentences = [];
let currentSentenceIndex = 0;
let lastFileName = "";

// Utility logging function
function logMessage(msg) {
  console.log(msg);
  if (logArea) {
    const entry = document.createElement("div");
    entry.textContent = "📘 " + msg;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
  }
}

// Utility: Extract page count if PDF
function getPdfPageCount(arrayBuffer) {
  return pdfjsLib.getDocument({ data: arrayBuffer }).promise.then(pdf => pdf.numPages);
}

// 📂 File load handler
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  lastFileName = file.name;
  localStorage.setItem("lastFileName", lastFileName);
  logMessage("🟢 Loading file: " + file.name + " (" + Math.round(file.size / 1024) + " KB)");

  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();

  reader.onload = async function () {
    const content = reader.result;

    if (ext === "pdf") {
      logMessage("🔍 Parsing PDF...");
      const typedarray = new Uint8Array(content);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(" ");
        text += pageText + " ";
      }

      extractedText = text.trim();
      logMessage(`📄 PDF loaded: ${pdf.numPages} pages.`);
    } else {
      extractedText = content;
      logMessage("📝 Text file loaded.");
    }

    // Parse sentences for TTS
    sentences = extractedText.match(/[^.!?]+[.!?]+/g) || [extractedText];
    currentSentenceIndex = 0;
    textDisplay.innerHTML = sentences.map((s, i) =>
      `<span id="s-${i}" class="sentence">${s.trim()}</span>`
    ).join(" ");

    // Save preview to localStorage
    localStorage.setItem("extractedText", extractedText.slice(0, 200));
    logMessage("✅ Text parsed into " + sentences.length + " sentences.");
  };

  // Read file
  if (ext === "pdf") reader.readAsArrayBuffer(file);
  else reader.readAsText(file);
});


/***************************
 * MODULE 2: INIT + SETTINGS RESTORE
 ***************************/

// Global database reference
let db;

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);
    request.onerror = () => reject("❌ Failed to open IndexedDB");
    request.onsuccess = () => {
      db = request.result;
      log("✅ IndexedDB ready.");
      resolve();
    };
    request.onupgradeneeded = event => {
      db = event.target.result;
      db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("settings", { keyPath: "key" });
      log("📁 Object stores created.");
    };
  });
}

// Load user settings from DB
function loadSettings() {
  const tx = db.transaction("settings", "readonly");
  const store = tx.objectStore("settings");
  const keys = ["ttsEngine", "voice", "pitch", "rate", "autoplay", "theme"];
  keys.forEach(key => {
    const req = store.get(key);
    req.onsuccess = () => {
      if (req.result) {
        localStorage.setItem(key, req.result.value);
        log(`🔧 Restored setting: ${key} = ${req.result.value}`);
      }
    };
  });
}

// Restore selected section/tab on page load
function restoreSection() {
  const lastSection = localStorage.getItem("lastSection") || "home";
  navigate(lastSection);
}

// Load available TTS engines for Listen & Capture
function loadTTSEngines(context) {
  const engineDropdown = document.getElementById(`tts-engine-${context}`);
  engineDropdown.innerHTML = "";
  const engines = ["Google", "IBM", "ResponsiveVoice", "Local"];
  engines.forEach(engine => {
    const option = document.createElement("option");
    option.value = engine;
    option.textContent = engine;
    engineDropdown.appendChild(option);
  });

  // Restore selection
  const saved = localStorage.getItem("ttsEngine");
  if (saved) engineDropdown.value = saved;
}

// Restore Listen and Capture Library items
function restoreLibraryItems(type) {
  const storeName = "files";
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    const items = request.result.filter(f => f.category === type);
    const container = document.getElementById(`${type}-library`);
    items.forEach(item => {
      const el = document.createElement("div");
      el.className = "library-item";
      el.textContent = item.name || "Untitled";
      container.appendChild(el);
    });
    log(`📚 Restored ${items.length} items in ${type} library.`);
  };
}

// ===========================
// MODULE 3 – Playback Controls
// ===========================

let utterance;
// let currentSentenceIndex = 0;
let isLooping = false;

function playCurrentSentence() {
  if (currentSentenceIndex >= sentences.length) {
    if (isLooping) {
      currentSentenceIndex = 0;
    } else {
      return;
    }
  }
  const sentence = sentences[currentSentenceIndex];
  utterance = new SpeechSynthesisUtterance(sentence);
  utterance.rate = parseFloat(document.getElementById("rate").value);
  utterance.pitch = parseFloat(document.getElementById("pitch").value);
  utterance.voice = getSelectedVoice();
  utterance.onend = () => {
    currentSentenceIndex++;
    playCurrentSentence();
  };
  speechSynthesis.speak(utterance);
}

function pauseSpeech() {
  speechSynthesis.pause();
}

function stopSpeech() {
  speechSynthesis.cancel();
  currentSentenceIndex = 0;
}

document.getElementById("play-btn").addEventListener("click", playCurrentSentence);
document.getElementById("pause-btn").addEventListener("click", pauseSpeech);
document.getElementById("stop-btn").addEventListener("click", stopSpeech);
document.getElementById("loop-btn").addEventListener("click", () => {
  isLooping = !isLooping;
  document.getElementById("loop-btn").classList.toggle("active", isLooping);
});

// ===== Module 4 + 4A =====
// MODULE 4: File Upload Enhancements & Validations
const allowedExtensions = [
  '.pdf', '.txt', '.doc', '.docx', '.epub', '.pptx', '.xlsx', '.xlsm', '.xls', '.xltx', '.xltm'
];

function isValidFile(file) {
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

document.getElementById("upload-files-btn").addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  const validFiles = files.filter(isValidFile);

  if (validFiles.length !== files.length) {
    alert("Some files were skipped due to unsupported types.");
  }

  validFiles.forEach(file => {
    saveFileToLibrary(file); // Assuming function defined earlier
  });
});

// MODULE 4A: Bulk Delete and Tooltips
function addCheckboxesToLibraryItems() {
  const items = document.querySelectorAll(".library-item");
  items.forEach(item => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("bulk-delete-checkbox");
    item.insertBefore(checkbox, item.firstChild);
  });
}

document.getElementById("bulk-delete-btn").addEventListener("click", () => {
  const selected = document.querySelectorAll(".bulk-delete-checkbox:checked");
  if (selected.length === 0) return alert("No items selected.");
  if (!confirm(`Delete ${selected.length} selected items?`)) return;

  selected.forEach(cb => {
    const item = cb.closest(".library-item");
    item.remove();
    // Optional: also remove from DB if needed
  });
});

function applyTooltips() {
  const tooltips = {
    "upload-files-btn": "Upload files (PDF, DOCX, TXT, EPUB, PPTX, XLSX...)",
    "save-to-library-btn": "Save current item to Listen Library",
    "bulk-delete-btn": "Delete selected items from Library",
    "play-button": "Play selected file",
    "add-to-playlist-btn": "Add item to Playlist (max 10)"
  };

  Object.entries(tooltips).forEach(([id, tip]) => {
    const el = document.getElementById(id);
    if (el) el.title = tip;
  });
}

document.addEventListener("DOMContentLoaded", applyTooltips);

// ===========================================================
// ✅ MODULE 5: Upload Filtering, Bulk Delete, and Tooltips
// ===========================================================

// 1️⃣ FILE TYPE FILTERING ON UPLOAD
document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("file-upload");
  if (uploadInput) {
    uploadInput.setAttribute(
      "accept",
      ".pdf,.txt,.docx,.epub,.pptx,.doc,.xlsx,.xlsm,.xls,.xltx,.xltm"
    );
  }
});

// 2️⃣ BULK DELETE FROM LISTEN LIBRARY
function initializeBulkDeleteFeature() {
  const deleteButton = document.getElementById("delete-selected-listen-btn");
  const libraryContainer = document.getElementById("listen-library");

  if (!deleteButton || !libraryContainer) return;

  deleteButton.addEventListener("click", () => {
    const checkboxes = libraryContainer.querySelectorAll("input[type='checkbox']:checked");

    if (checkboxes.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete the selected item(s)?")) return;

    checkboxes.forEach((cb) => {
      const parent = cb.closest(".library-item");
      if (parent) parent.remove();
    });

    alert("Selected items deleted successfully.");
  });
}

function addCheckboxesToLibrary() {
  const libraryContainer = document.getElementById("listen-library");
  if (!libraryContainer) return;

  const items = libraryContainer.querySelectorAll(".library-item");
  items.forEach((item) => {
    if (!item.querySelector("input[type='checkbox']")) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("bulk-delete-checkbox");
      item.insertBefore(checkbox, item.firstChild);
    }
  });
}

// Initialize both on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initializeBulkDeleteFeature();
  addCheckboxesToLibrary();
});

// 3️⃣ TOOLTIP SYSTEM FOR HOVER HINTS
function addTooltips() {
  const tooltipMap = [
    { id: "upload-files-btn", tip: "Upload documents to your Listen Library" },
    { id: "save-to-library-btn", tip: "Save this file to your personal Library" },
    { id: "download-selected-btn", tip: "Download selected items from Capture Library" },
    { id: "delete-selected-listen-btn", tip: "Delete selected Listen items" },
    { id: "read-queue-btn", tip: "Read all queued files continuously" },
    { id: "play-button", tip: "Start playback" },
    { id: "pause-button", tip: "Pause playback" },
    { id: "stop-button", tip: "Stop reading" },
    { id: "loop-button", tip: "Enable looping playback" },
    { id: "tts-engine-select", tip: "Select your preferred text-to-speech engine" },
    { id: "voice-select", tip: "Choose a reading voice" },
    { id: "rate-slider", tip: "Control reading speed" },
    { id: "pitch-slider", tip: "Adjust voice pitch" }
  ];

  tooltipMap.forEach(({ id, tip }) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("title", tip);
      el.setAttribute("data-tooltip", tip);
      el.classList.add("tooltip-enabled");
    }
  });
}

document.addEventListener("DOMContentLoaded", addTooltips);


/* =============================
   ✅ MODULE 6 — Advanced Queue, Favorites, Auto-Resume & UI Enhancements
   ============================= */

// Constants
const MAX_PLAYLIST_ITEMS = 10;
const MAX_LIBRARY_ITEMS = 100;
let favorites = [];
let downloadQueue = [];

/* --- Auto Resume Settings --- */
function loadAutoResumeSetting() {
  const autoResume = localStorage.getItem("autoResume") === "true";
  document.getElementById("auto-resume-toggle").checked = autoResume;
}

function toggleAutoResumeSetting() {
  const toggle = document.getElementById("auto-resume-toggle");
  localStorage.setItem("autoResume", toggle.checked);
}

/* --- Add to Favorites --- */
function toggleFavorite(itemId) {
  if (favorites.includes(itemId)) {
    favorites = favorites.filter(id => id !== itemId);
  } else {
    if (favorites.length >= 10) {
      alert("You can only have up to 10 favorites.");
      return;
    }
    favorites.push(itemId);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  const favContainer = document.getElementById("favorites-section");
  favContainer.innerHTML = "";
  favorites.forEach(id => {
    const item = document.getElementById(id);
    if (item) {
      const clone = item.cloneNode(true);
      clone.querySelector(".fav-icon")?.remove();
      favContainer.appendChild(clone);
    }
  });
}

/* --- Context Menu Enhancements --- */
function handleContextMenu(event, itemId, type) {
  event.preventDefault();
  const menu = document.getElementById("context-menu");
  menu.style.top = `${event.clientY}px`;
  menu.style.left = `${event.clientX}px`;
  menu.style.display = "block";

  menu.querySelector("#menu-play").onclick = () => playItem(itemId);
  menu.querySelector("#menu-add").onclick = () => addToPlaylist(itemId);
  menu.querySelector("#menu-download").onclick = () => downloadItem(itemId, type);
  menu.querySelector("#menu-fav").onclick = () => toggleFavorite(itemId);
  menu.querySelector("#menu-delete").onclick = () => deleteItem(itemId, type);
}

function hideContextMenu() {
  document.getElementById("context-menu").style.display = "none";
}
document.addEventListener("click", hideContextMenu);

/* --- Auto Playlist Play --- */
function playPlaylistSequentially(index = 0) {
  if (index >= playlist.length) return;
  const currentId = playlist[index];
  playItem(currentId, () => playPlaylistSequentially(index + 1));
}

/* --- Auto Resume Playback --- */
function resumeLastPlayback() {
  const lastId = localStorage.getItem("lastPlayedId");
  if (lastId && document.getElementById("auto-resume-toggle").checked) {
    playItem(lastId);
  }
}

/* --- Download Queue --- */
function addToDownloadQueue(itemId) {
  if (!downloadQueue.includes(itemId)) {
    downloadQueue.push(itemId);
  }
}

function downloadItem(itemId, type) {
  const item = document.getElementById(itemId);
  if (!item) return;

  const text = item.querySelector(".text-content")?.innerText || "Untitled";
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${itemId}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* --- Initialization --- */
window.addEventListener("DOMContentLoaded", () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  renderFavorites();
  loadAutoResumeSetting();
});

// =======================
// 📦 Module 7: Playlist Enhancements and Playback Features
// =======================

// Global playlist array
let playlist = [];

// Load playlist from localStorage if exists
function loadPlaylist() {
  const stored = localStorage.getItem("neurAloudPlaylist");
  playlist = stored ? JSON.parse(stored) : [];
  updatePlaylistUI();
}

// Save playlist to localStorage
function savePlaylist() {
  localStorage.setItem("neurAloudPlaylist", JSON.stringify(playlist));
}

// Add file to playlist
function addToPlaylist(fileId) {
  if (!playlist.includes(fileId)) {
    playlist.push(fileId);
    savePlaylist();
    updatePlaylistUI();
  }
}

// Remove file from playlist
function removeFromPlaylist(fileId) {
  playlist = playlist.filter(id => id !== fileId);
  savePlaylist();
  updatePlaylistUI();
}

// Reorder playlist
function reorderPlaylist(fromIndex, toIndex) {
  const item = playlist.splice(fromIndex, 1)[0];
  playlist.splice(toIndex, 0, item);
  savePlaylist();
  updatePlaylistUI();
}

// Play the current playlist sequentially
let currentPlaylistIndex = 0;

function playPlaylistSequentially() {
  if (playlist.length === 0) return;
  const fileId = playlist[currentPlaylistIndex];
  playFileById(fileId, () => {
    currentPlaylistIndex++;
    if (currentPlaylistIndex < playlist.length) {
      playPlaylistSequentially();
    } else {
      currentPlaylistIndex = 0;
    }
  });
}

// Update the UI for playlist
function updatePlaylistUI() {
  const container = document.getElementById("playlist-container");
  if (!container) return;
  container.innerHTML = "";
  playlist.forEach((fileId, index) => {
    const div = document.createElement("div");
    div.className = "playlist-item";
    div.textContent = getFileNameById(fileId) || `File ${fileId}`;
    div.setAttribute("draggable", "true");
    div.setAttribute("data-index", index);
    div.ondragstart = e => {
      e.dataTransfer.setData("text/plain", index);
    };
    div.ondragover = e => {
      e.preventDefault();
    };
    div.ondrop = e => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const toIndex = parseInt(div.getAttribute("data-index"), 10);
      reorderPlaylist(fromIndex, toIndex);
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "➖";
    removeBtn.onclick = () => {
      if (confirm("Remove this file from Playlist?")) {
        removeFromPlaylist(fileId);
      }
    };

    div.appendChild(removeBtn);
    container.appendChild(div);
  });
}

// Simulated play function
function playFileById(fileId, callback) {
  const fileText = getFileTextById(fileId);
  if (!fileText) {
    alert("❌ Unable to play file.");
    return;
  }

  // Break text into sentences
  const sentences = fileText.match(/[^.!?]+[.!?]+/g) || [fileText];
  let index = 0;

  const speakSentence = () => {
    if (index >= sentences.length) {
      if (callback) callback();
      return;
    }

    const utter = new SpeechSynthesisUtterance(sentences[index]);
    utter.onend = () => {
      index++;
      speakSentence();
    };
    speechSynthesis.speak(utter);
  };

  speakSentence();
}

// Utility: Fetch file name by ID
function getFileNameById(id) {
  const files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  const found = files.find(f => f.id === id);
  return found ? found.name : null;
}

// Utility: Fetch file text by ID
function getFileTextById(id) {
  const files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  const found = files.find(f => f.id === id);
  return found ? found.text : null;
}

// Initialize playlist on load
window.addEventListener("DOMContentLoaded", loadPlaylist);

/**
 * Module 8 – Profile Customization & User Settings
 * Handles saving, restoring, and applying user preferences such as:
 * - Theme selection
 * - Playback settings (rate, pitch, voice)
 * - Notification preferences
 * - Language and translation options
 * - Developer mode toggle
 */

const PROFILE_SETTINGS_KEY = "userProfileSettings";

// Default profile settings
const defaultProfileSettings = {
  theme: "light",
  ttsRate: 1.0,
  ttsPitch: 1.0,
  selectedVoice: "",
  autoResume: false,
  notificationTime: "18:30",
  language: "en-US",
  translationLanguage: "none",
  developerMode: false,
};

// Save profile settings to localStorage
function saveProfileSettings(settings) {
  localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(settings));
}

// Load profile settings from localStorage or defaults
function loadProfileSettings() {
  const stored = localStorage.getItem(PROFILE_SETTINGS_KEY);
  return stored ? JSON.parse(stored) : defaultProfileSettings;
}

// Apply profile settings to UI and system
function applyProfileSettings(settings) {
  if (settings.theme) setTheme(settings.theme);
  if (settings.ttsRate) rateSlider.value = settings.ttsRate;
  if (settings.ttsPitch) pitchSlider.value = settings.ttsPitch;
  if (settings.selectedVoice) voiceSelect.value = settings.selectedVoice;
  if (settings.autoResume !== undefined) autoResumeToggle.checked = settings.autoResume;
  if (settings.language) languageSelect.value = settings.language;
  if (settings.translationLanguage) translationSelect.value = settings.translationLanguage;
  if (settings.notificationTime) document.getElementById("notification-time").value = settings.notificationTime;
  document.body.dataset.developer = settings.developerMode;
}

// Set theme
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Toggle developer mode
function toggleDeveloperMode() {
  const settings = loadProfileSettings();
  settings.developerMode = !settings.developerMode;
  saveProfileSettings(settings);
  applyProfileSettings(settings);
}

// UI Handlers
document.getElementById("save-profile-btn").addEventListener("click", () => {
  const settings = {
    theme: document.querySelector("input[name='theme']:checked").value,
    ttsRate: parseFloat(rateSlider.value),
    ttsPitch: parseFloat(pitchSlider.value),
    selectedVoice: voiceSelect.value,
    autoResume: autoResumeToggle.checked,
    notificationTime: document.getElementById("notification-time").value,
    language: languageSelect.value,
    translationLanguage: translationSelect.value,
    developerMode: document.body.dataset.developer === "true",
  };
  saveProfileSettings(settings);
  applyProfileSettings(settings);
  alert("✅ Profile settings saved.");
});

document.addEventListener("DOMContentLoaded", () => {
  const settings = loadProfileSettings();
  applyProfileSettings(settings);
});


// ======================
// 📦 MODULE 9: Ads Integration and Management
// ======================

// ✅ Ad Display Conditions
const showAds = () => {
  const isPremium = localStorage.getItem("userPlan") === "premium";
  const adContainers = document.querySelectorAll(".ad-container");
  adContainers.forEach(container => {
    container.style.display = isPremium ? "none" : "block";
  });
};

// ✅ Ad Slots Initialization
const initAds = () => {
  const adSlotIds = ["sidebar-ad", "footer-ad"];
  adSlotIds.forEach(id => {
    const slot = document.getElementById(id);
    if (slot) {
      slot.innerHTML = "<span class='ad-placeholder'>[Ad Placeholder]</span>";
    }
  });
  showAds();
};

// ✅ Consent Modal
const displayConsentModal = () => {
  if (localStorage.getItem("adsConsent") !== "true") {
    const consent = confirm("We use ads to support the app. Continue?");
    localStorage.setItem("adsConsent", consent ? "true" : "false");
  }
};

// ✅ Toggle Ads Debug
const toggleAdDebug = () => {
  const current = localStorage.getItem("adDebug") === "true";
  localStorage.setItem("adDebug", !current);
  alert("Ad Debug mode is now " + (!current ? "ON" : "OFF"));
};

// ✅ DOMContentLoaded Initialization
document.addEventListener("DOMContentLoaded", () => {
  displayConsentModal();
  initAds();
});

// ✅ Manual Control for Admin
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "d") {
    toggleAdDebug();
  }
});

// 📦 Module 10: Floating Playback Panel with Enhanced Features

document.addEventListener("DOMContentLoaded", () => {
  initFloatingPanel();
});

function initFloatingPanel() {
  const panel = document.createElement("div");
  panel.id = "floating-panel";
  panel.innerHTML = `
    <div id="panel-header">
      <span id="panel-title">🔊 Floating Player</span>
      <button id="panel-close">❌</button>
    </div>
    <div id="panel-controls">
      <button id="panel-play">▶️</button>
      <button id="panel-pause">⏸️</button>
      <button id="panel-stop">⏹️</button>
      <button id="panel-loop">🔁</button>
      <span id="panel-timer">0:00</span>
    </div>
    <div id="panel-voice-settings">
      <label>Voice:</label>
      <select id="panel-voice-dropdown"></select>
      <label>Speed:</label>
      <input type="range" id="panel-speed" min="0.5" max="2" step="0.1" value="1">
      <label>Pitch:</label>
      <input type="range" id="panel-pitch" min="0" max="2" step="0.1" value="1">
    </div>
    <div id="panel-options">
      <button id="panel-bookmark">🔖</button>
      <button id="panel-repeat">🔁 Section</button>
      <button id="panel-note">📝</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Controls wiring
  document.getElementById("panel-close").onclick = () => panel.style.display = "none";
  document.getElementById("panel-play").onclick = () => playFloatingContent();
  document.getElementById("panel-pause").onclick = () => speechSynthesis.pause();
  document.getElementById("panel-stop").onclick = () => {
    speechSynthesis.cancel();
    updateTimer(0);
  };
  document.getElementById("panel-loop").onclick = () => toggleLoop();

  // Voice dropdown populated
  loadTTSEngines("floating");
  populateVoiceDropdown("floating");

  // Optional: drag-to-move
  enableDrag(panel);
}

function playFloatingContent() {
  const content = getCurrentlyHighlightedSentence() || "No text selected";
  const voice = document.getElementById("panel-voice-dropdown").value;
  const rate = parseFloat(document.getElementById("panel-speed").value);
  const pitch = parseFloat(document.getElementById("panel-pitch").value);

  const utterance = new SpeechSynthesisUtterance(content);
  utterance.voice = getVoiceByName(voice);
  utterance.rate = rate;
  utterance.pitch = pitch;

  utterance.onboundary = e => {
    if (e.name === "word") updateTimer(e.elapsedTime);
  };

  speechSynthesis.speak(utterance);
}

function updateTimer(ms) {
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const remaining = sec % 60;
  document.getElementById("panel-timer").textContent = `${min}:${remaining.toString().padStart(2, "0")}`;
}

function toggleLoop() {
  isLooping = !isLooping;
  document.getElementById("panel-loop").classList.toggle("active", isLooping);
}

// Basic drag
function enableDrag(el) {
  el.onmousedown = function (e) {
    e.preventDefault();
    let shiftX = e.clientX - el.getBoundingClientRect().left;
    let shiftY = e.clientY - el.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      el.style.left = pageX - shiftX + 'px';
      el.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);
    el.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      el.onmouseup = null;
    };
  };
  el.ondragstart = () => false;
}

// ============ Module 6: Side Panel & Playback Queue ============
// ✅ NeurAloud Full Script (Module 1–6 Merged)
document.addEventListener("DOMContentLoaded", initSidePanel);
function initSidePanel() {
  const panel = document.getElementById("side-panel");
  const backdrop = document.getElementById("side-panel-backdrop");
  const toggleButton = document.getElementById("side-panel-toggle");
  const closeButton = document.getElementById("side-panel-close");
  const readButton = document.getElementById("read-live-button");
  const urlInput = document.getElementById("live-url");
  const contentDiv = document.getElementById("side-panel-content");
  const voiceSelect = document.getElementById("voice-select");
  const rateSlider = document.getElementById("rate");
  const pitchSlider = document.getElementById("pitch");
  const rateVal = document.getElementById("rate-val");
  const pitchVal = document.getElementById("pitch-val");
  const playBtn = document.getElementById("play-tts");
  const pauseBtn = document.getElementById("pause-tts");
  const stopBtn = document.getElementById("stop-tts");
  const repeatBtn = document.getElementById("repeat-tts");
  const loopToggle = document.getElementById("loop-toggle");
  const smartSkipToggle = document.getElementById("smart-skip-toggle");
  const thresholdSlider = document.getElementById("importance-threshold");
  const thresholdVal = document.getElementById("threshold-val");
  const addToQueueBtn = document.getElementById("add-to-queue");
  const queueList = document.getElementById("playback-queue");
  const clearQueueBtn = document.getElementById("clear-queue");
  let utterance, isPaused = false;
  let sentenceList = [], sentenceIndex = 0;
  let currentContent = "";
  let queue = [];
  toggleButton.addEventListener("click", () => {
    panel.classList.add("open");
    backdrop.classList.add("open");
  closeButton.addEventListener("click", () => {
    panel.classList.remove("open");
    backdrop.classList.remove("open");
  backdrop.addEventListener("click", () => {
    panel.classList.remove("open");
    backdrop.classList.remove("open");
  readButton.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return contentDiv.textContent = "⚠️ Please enter a valid URL.";
    contentDiv.textContent = "🔄 Loading...";
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body?.innerText?.trim() || "⚠️ Could not extract text.";
      currentContent = text;
      contentDiv.textContent = text;
      splitSentences(text);
    } catch (e) {
      contentDiv.textContent = "❌ Error loading or parsing URL.";
  function splitSentences(text) {
    sentenceList = text.match(/[^.!?]+[.!?]+/g) || [];
    sentenceIndex = 0;
  function scoreSentence(sentence) {
    const keywords = ["important", "must", "need", "critical"];
    let score = sentence.length / 120;
    keywords.forEach(k => { if (sentence.includes(k)) score += 0.2; });
    if (/[!?\-:]/.test(sentence)) score += 0.2;
    return Math.min(score, 1.0);
  function playSentences() {
    if (!sentenceList.length) return;
    if (sentenceIndex >= sentenceList.length) {
      if (loopToggle.checked) sentenceIndex = 0;
      else return;
    const sentence = sentenceList[sentenceIndex];
    const score = scoreSentence(sentence);
    const threshold = parseFloat(thresholdSlider.value);
    if (smartSkipToggle.checked && score < threshold) {
      console.log("⏭️ Skipped:", sentence, "Score:", score.toFixed(2));
      sentenceIndex++;
      playSentences();
    const voiceName = voiceSelect.value;
    utterance = new SpeechSynthesisUtterance(sentence);
    utterance.voice = speechSynthesis.getVoices().find(v => v.name === voiceName);
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);
    utterance.onend = () => {
      sentenceIndex++;
      playSentences();
    highlightSentence(sentence);
    speechSynthesis.speak(utterance);
  function highlightSentence(sentence) {
    const content = contentDiv.textContent;
    const start = content.indexOf(sentence);
    if (start < 0) return;
    const end = start + sentence.length;
    contentDiv.innerHTML =
      content.substring(0, start) +
      `<mark>${sentence}</mark>` +
      content.substring(end);
  playBtn.addEventListener("click", () => {
    if (isPaused && utterance) {
      speechSynthesis.resume();
      isPaused = false;
      splitSentences(currentContent);
      playSentences();
  pauseBtn.addEventListener("click", () => {
    speechSynthesis.pause();
    isPaused = true;
  stopBtn.addEventListener("click", () => {
    sentenceIndex = 0;
    isPaused = false;
  repeatBtn.addEventListener("click", () => {
    sentenceIndex = Math.max(0, sentenceIndex - 1);
    isPaused = false;
    playSentences();
  loopToggle.addEventListener("change", () => {
    localStorage.setItem("loopEnabled", loopToggle.checked);
  // Voice options
  function populateVoices() {
    const voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = voices.map(v => `<option value="${v.name}">${v.name}</option>`).join("");
    const savedVoice = localStorage.getItem("voiceSelect");
    if (savedVoice) voiceSelect.value = savedVoice;
  speechSynthesis.onvoiceschanged = populateVoices;
  populateVoices();
  voiceSelect.addEventListener("change", () => {
    localStorage.setItem("voiceSelect", voiceSelect.value);
  rateSlider.addEventListener("input", () => {
    rateVal.textContent = parseFloat(rateSlider.value).toFixed(2);
    localStorage.setItem("rate", rateSlider.value);
  pitchSlider.addEventListener("input", () => {
    pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(2);
    localStorage.setItem("pitch", pitchSlider.value);
  smartSkipToggle.addEventListener("change", () => {
    localStorage.setItem("smartSkip", smartSkipToggle.checked);
  thresholdSlider.addEventListener("input", () => {
    thresholdVal.textContent = parseFloat(thresholdSlider.value).toFixed(2);
    localStorage.setItem("threshold", thresholdSlider.value);
  // Load persisted settings
  function restoreSettings() {
    if (localStorage.getItem("loopEnabled") === "true") loopToggle.checked = true;
    if (localStorage.getItem("smartSkip") === "true") smartSkipToggle.checked = true;
    if (localStorage.getItem("threshold")) {
      thresholdSlider.value = localStorage.getItem("threshold");
      thresholdVal.textContent = parseFloat(thresholdSlider.value).toFixed(2);
    if (localStorage.getItem("rate")) {
      rateSlider.value = localStorage.getItem("rate");
      rateVal.textContent = parseFloat(rateSlider.value).toFixed(2);
    if (localStorage.getItem("pitch")) {
      pitchSlider.value = localStorage.getItem("pitch");
      pitchVal.textContent = parseFloat(pitchSlider.value).toFixed(2);
  restoreSettings();
  // Drag and Drop for Queue
  queueList.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    e.target.classList.add("dragging");
  queueList.addEventListener("dragend", (e) => {
    e.target.classList.remove("dragging");
  queueList.addEventListener("dragover", (e) => {
    const afterElement = getDragAfterElement(queueList, e.clientY);
    const dragging = document.querySelector(".dragging");
    if (afterElement == null) {
      queueList.appendChild(dragging);
      queueList.insertBefore(dragging, afterElement);
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  // Export Options
  document.getElementById("export-txt").addEventListener("click", exportQueueAsText);
  document.getElementById("export-json").addEventListener("click", exportQueueAsJSON);
  function exportQueueAsText() {
    const items = Array.from(document.querySelectorAll("#playback-queue li"))
                       .map(el => el.textContent.trim());
    const blob = new Blob([items.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "queue.txt";
    a.click();
  function exportQueueAsJSON() {
    const items = Array.from(document.querySelectorAll("#playback-queue li"))
                       .map(el => ({ text: el.textContent.trim() }));
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "queue.json";
    a.click();
  // Queue Preview
  document.querySelectorAll("#playback-queue li").forEach(li => {
    li.addEventListener("click", () => {
      alert(`Preview: ${li.textContent.trim()}`);
  // Add to Queue
  addToQueueBtn.addEventListener("click", () => {
    const title = prompt("🎵 Enter queue item title:");
    if (title) {
      const li = document.createElement("li");
      li.textContent = title;
      li.setAttribute("draggable", "true");
      queueList.appendChild(li);
      li.addEventListener("click", () => alert(`Preview: ${li.textContent.trim()}`));
  // Clear Queue
  clearQueueBtn.addEventListener("click", () => {
    if (confirm("❌ Clear all items from the queue?")) {
      queueList.innerHTML = "";
// Optional: Initialize Side Panel on Page Load
window.addEventListener("load", () => {
  if (localStorage.getItem("sidePanelOpen") === "true") {
    document.getElementById("side-panel").classList.add("open");
    document.getElementById("side-panel-backdrop").classList.add("open");
// Optional: Save panel state
document.getElementById("side-panel-toggle").addEventListener("click", () => {
  localStorage.setItem("sidePanelOpen", "true");
document.getElementById("side-panel-close").addEventListener("click", () => {
  localStorage.setItem("sidePanelOpen", "false");
document.getElementById("side-panel-backdrop").addEventListener("click", () => {
  localStorage.setItem("sidePanelOpen", "false");

// === Module 7: Playback Queue Enhancements ===

// Save current queue to localStorage
function saveQueueToLocal() {
  const queueItems = Array.from(document.querySelectorAll("#playback-queue li")).map(li => li.textContent.trim());
  localStorage.setItem("playbackQueue", JSON.stringify(queueItems));
}

// Load and restore queue from localStorage
function loadQueueFromLocal() {
  const saved = JSON.parse(localStorage.getItem("playbackQueue") || "[]");
  const ul = document.getElementById("playback-queue");
  ul.innerHTML = "";
  saved.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    li.setAttribute("draggable", "true");
    ul.appendChild(li);
  });
  addQueuePreviewHandlers();
}

// Add current input to queue and persist
function addToQueueAndSave(text) {
  const ul = document.getElementById("playback-queue");
  const li = document.createElement("li");
  li.textContent = text.trim();
  li.setAttribute("draggable", "true");
  ul.appendChild(li);
  addQueuePreviewHandlers();
  saveQueueToLocal();
}

// Playback entire queue in order
function playQueueSequentially() {
  const queueItems = Array.from(document.querySelectorAll("#playback-queue li"));
  if (queueItems.length === 0) return;

  let index = 0;
  function playNext() {
    if (index >= queueItems.length) return;
    const text = queueItems[index].textContent.trim();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => {
      index++;
      playNext();
    };
    speechSynthesis.speak(utter);
  }

  playNext();
}

// Modal Preview Logic
function setupPreviewModal() {
  const modal = document.getElementById("preview-modal");
  const modalText = document.getElementById("modal-text");
  const closeBtn = document.getElementById("modal-close");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.querySelectorAll("#playback-queue li").forEach(li => {
    li.addEventListener("click", () => {
      modalText.textContent = li.textContent.trim();
      modal.style.display = "block";
    });
  });
}

// Initialize all Module 7 logic
function initModule7QueuePlayback() {
  document.getElementById("play-all").addEventListener("click", playQueueSequentially);
  document.getElementById("export-txt").addEventListener("click", exportQueueAsText);
  document.getElementById("export-json").addEventListener("click", exportQueueAsJSON);
  loadQueueFromLocal();
  setupPreviewModal();
}
