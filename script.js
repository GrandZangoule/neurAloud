// === Navigation Fix ===
function navigate(id) {
  console.log("Navigating to:", id);  // Add this
  document.querySelectorAll("main section").forEach(section =>
    section.classList.remove("active-section")
  );
  const target = document.getElementById(id);
  if (target) target.classList.add("active-section");
}


// 🧩 Module 1: File Load, Text Extraction, and Metadata Setup (Enhanced)

// Element bindings
const fileInput = document.getElementById("file-input");
const textDisplay = document.getElementById("text-display");
const logArea = document.getElementById("log-area");

// Safe logging function
const log = (...args) => console.log("📘", ...args);
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

// ✅ Add this immediately after the above:
async function loadLastSessionFile() {
  const lastFileName = localStorage.getItem("lastFileName");
  if (!lastFileName || !db) return;

  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");
  const req = store.getAll();

  req.onsuccess = async () => {
    const files = req.result;
    const lastFile = files.find(f => f.name === lastFileName && f.category === "last");

    if (!lastFile) return;

    log("🔄 Restoring last loaded file: " + lastFile.name);

    extractedText = lastFile.content;
    sentences = extractedText.match(/[^.!?]+[.!?]+/g) || [extractedText];
    currentSentenceIndex = parseInt(localStorage.getItem("currentSentenceIndex") || "0");

    if (textDisplay) {
      textDisplay.innerHTML = sentences.map((s, i) =>
        `<span id="s-${i}" class="sentence">${s.trim()}</span>`
      ).join(" ");
    }

    log("✅ Session restored with " + sentences.length + " sentences.");
  };
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

// Render & Restore Listen and Capture Library items
function renderLibraryItem(item, type) {
  const container = document.getElementById(`${type}-library`);
  if (!container) {
    console.warn(`⚠️ Container #${type}-library not found.`);
    return;
  }

  const el = document.createElement("div");
  el.className = `library-item ${type}-item`;
  el.classList.add("theme-background", "theme-text");
  el.id = item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  el.setAttribute("data-tooltip", "Right-click or long-press for options");

  const textSpan = document.createElement("span");
  textSpan.className = "text-content";
  textSpan.textContent = item.name || "Untitled";

  el.appendChild(textSpan);
  container.appendChild(el);

  // ✅ Right-click support
  el.addEventListener("contextmenu", (e) => handleContextMenu(e, el.id, type));

  // ✅ Long-press mobile support
  let pressTimer = null;
  el.addEventListener("touchstart", e => {
    pressTimer = setTimeout(() => handleContextMenu(e, el.id, type), 500);
  });
  el.addEventListener("touchend", () => clearTimeout(pressTimer));
}

function restoreLibraryItems(type) {
  const storeName = "files";
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    const items = request.result.filter(f => f.category === type);
    const container = document.getElementById(`${type}-library`);
    if (!container) {
      console.warn(`⚠️ Container #${type}-library not found.`);
      return;
    }

    container.innerHTML = ""; // Clear existing before restore
    items.forEach(item => renderLibraryItem(item, type));

    log(`📚 Restored ${items.length} items in ${type} library.`);
  };

  request.onerror = () => {
    console.error("❌ Failed to restore library items.");
  };
}


// ===========================
// MODULE 3 – Playback Controls
// ===========================

let utterance;
// let currentSentenceIndex = 0;
let isLooping = false;

function playCurrentSentence() {
  if (sentences.length === 0) return;

  if (currentSentenceIndex >= sentences.length) {
    if (isLooping) {
      currentSentenceIndex = 0;
    } else {
      return; // Stop playback if not looping
    }
  }

  const sentence = sentences[currentSentenceIndex];
  utterance = new SpeechSynthesisUtterance(sentence);

  // Set user-controlled options
  const rateInput = document.getElementById("rate");
  const pitchInput = document.getElementById("pitch");
  const voice = getSelectedVoice();

  utterance.rate = rateInput ? parseFloat(rateInput.value) : 1.0;
  utterance.pitch = pitchInput ? parseFloat(pitchInput.value) : 1.0;
  utterance.voice = voice;

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
  '.pdf', '.txt', '.doc', '.docx', '.epub', '.pptx', '.csv', '.rtf', '.msg', '.sql', '.webp', '.xlsx', '.xlsm', '.xls', '.xltx', '.xltm', '.tif', '.eps', '.tmp' 
];

function isValidFile(file) {
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

document.addEventListener("DOMContentLoaded", () => {
  const uploadFilesInput = document.getElementById("upload-files-btn");
  if (uploadFilesInput) {
    uploadFilesInput.addEventListener("change", (event) => {
      const files = Array.from(event.target.files);
      const validFiles = files.filter(isValidFile);

      if (validFiles.length !== files.length) {
        alert("Some files were skipped due to unsupported types.");
      }

      validFiles.forEach(file => {
        saveFileToLibrary(file);
      });
    });
  }
});

// MODULE 4A: Bulk Delete for Listen and Capture Libraries + Tooltips

function addCheckboxesToLibraryItems() {
  const listenItems = document.querySelectorAll("#listen-library .library-item");
  const captureItems = document.querySelectorAll("#capture-library .library-item");

  [...listenItems, ...captureItems].forEach(item => {
    if (!item.querySelector(".bulk-delete-checkbox")) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("bulk-delete-checkbox");
      item.insertBefore(checkbox, item.firstChild);
    }
  });
}

function setupBulkDeleteButton(btnId, containerId) {
  const btn = document.getElementById(btnId);
  const container = document.getElementById(containerId);
  if (!btn || !container) return;

  btn.addEventListener("click", () => {
    const checkedItems = container.querySelectorAll(".bulk-delete-checkbox:checked");
    if (checkedItems.length === 0) return alert("⚠️ No items selected.");
    if (!confirm(`Delete ${checkedItems.length} selected items from ${containerId}?`)) return;

    checkedItems.forEach(cb => {
      const item = cb.closest(".library-item");
      if (item) item.remove();
      // ❗ Optional: Remove from IndexedDB if applicable
    });

    alert(`✅ Deleted ${checkedItems.length} item(s).`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  addCheckboxesToLibraryItems();
  setupBulkDeleteButton("bulk-delete-listen-btn", "listen-library");
  setupBulkDeleteButton("bulk-delete-capture-btn", "capture-library");
});

function applyTooltips() {
  const tooltips = {
    "upload-files-btn": "Upload files (PDF, DOCX, TXT, EPUB, PPTX, XLSX...)",
    "save-to-library-btn": "Save current item to Listen Library",
    "bulk-delete-listen-btn": "Delete selected Listen Library items",
    "bulk-delete-capture-btn": "Delete selected Capture items",
    "play-button": "Play selected file",
    "add-to-playlist-btn": "Add item to Playlist (max 10)"
  };

  Object.entries(tooltips).forEach(([id, tip]) => {
    const el = document.getElementById(id);
    if (el) el.title = tip;
  });
}

document.addEventListener("DOMContentLoaded", applyTooltips);

// ===============================
// ✅ MODULE 4B: Enhanced 'Choose File' Handling with IndexedDB
// ===============================

// 1️⃣ Utility to save a file into IndexedDB
async function saveToIndexedDB(file, category = "session") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const content = reader.result;
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const entry = {
        name: file.name,
        size: file.size,
        type: file.type,
        content,
        timestamp: Date.now(),
        category
      };
      const request = store.add(entry);
      request.onsuccess = () => {
        const id = request.result;
        localStorage.setItem("lastFileId", id);
        resolve(id);
      };
      request.onerror = () => reject("❌ Failed to save to IndexedDB");
    };
    if (file.name.endsWith(".pdf")) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
}

// 2️⃣ Restore last file after refresh
function restoreLastFileFromIndexedDB() {
  const lastFileId = Number(localStorage.getItem("lastFileId"));
  if (!lastFileId) return;

  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");
  const request = store.get(lastFileId);

  request.onsuccess = () => {
    const entry = request.result;
    if (!entry) return;

    let text = "";
    if (entry.content instanceof ArrayBuffer) {
      const typedarray = new Uint8Array(entry.content);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(async (pdf) => {
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(" ") + " ";
        }
        showExtractedText(text);
      });
    } else {
      text = entry.content;
      showExtractedText(text);
    }
  };
}

// 3️⃣ Display text and parse sentences
function showExtractedText(text) {
  extractedText = text.trim();
  sentences = extractedText.match(/[^.!?]+[.!?]+/g) || [extractedText];
  currentSentenceIndex = 0;
  textDisplay.innerHTML = sentences.map((s, i) =>
    `<span id="s-${i}" class="sentence">${s.trim()}</span>`
  ).join(" ");
  logMessage("✅ Restored file with " + sentences.length + " sentences.");
}

// 4️⃣ Patch DOMContentLoaded to run restore

document.addEventListener("DOMContentLoaded", () => {
  if (db) restoreLastFileFromIndexedDB();
});

// ===============================
// MODULE 4C – Save to Listen Library with 100 Limit
// ===============================

async function saveFileToLibrary() {
  if (!extractedText || !lastFileName) {
    alert("No loaded file to save.");
    return;
  }

  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");

  // Get all current Listen items
  const getAllReq = store.getAll();
  getAllReq.onsuccess = () => {
    let listenItems = getAllReq.result.filter(f => f.category === "listen");

    // Check limit
    if (listenItems.length >= 100) {
      alert("📦 Library full! Remove items to save new ones.");
      return;
    }

    // Shift all existing listen files down by 1 (reversed to avoid overwrite)
    const updates = [];
    for (let i = listenItems.length - 1; i >= 0; i--) {
      const item = listenItems[i];
      updates.push(new Promise((res) => {
        const putReq = store.put({ ...item, priority: (item.priority || i) + 1 });
        putReq.onsuccess = () => res();
      }));
    }

    Promise.all(updates).then(() => {
      // Save current file as top priority (priority = 0)
      const newEntry = {
        name: lastFileName,
        content: extractedText,
        date: new Date().toISOString(),
        category: "listen",
        priority: 0
      };
      const addReq = store.add(newEntry);
      addReq.onsuccess = () => {
        logMessage(`✅ Saved '${lastFileName}' to Listen Library`);
        restoreLibraryItems("listen"); // refresh UI
      };
      addReq.onerror = () => {
        alert("❌ Failed to save file.");
      };
    });
  };
}


// ===========================================================
// ✅ MODULE 5: Upload Filtering, Bulk Delete, and Tooltips
// ===========================================================

// 1️⃣ FILE TYPE FILTERING ON UPLOAD (Enhanced)
document.addEventListener("DOMContentLoaded", async () => {
  const acceptedTypes = [
    ".pdf", ".txt", ".docx", ".epub", ".pptx", ".doc",
    ".xlsx", ".xlsm", ".xls", ".xltx", ".xltm",
    ".csv", ".rtf", ".msg", ".sql",
    ".webp", ".png", ".jpeg", ".jpg", ".bmp", ".tif", ".eps", ".tmp"
  ].join(",");

  const fileInputs = [
    document.getElementById("file-upload"),
    document.getElementById("upload-multiple-btn"),
    document.getElementById("upload-files-btn")
  ];

  fileInputs.forEach(input => {
    if (input) {
      input.setAttribute("accept", acceptedTypes);
      input.setAttribute("multiple", "multiple");
    }
  });

  // ✅ Initialize IndexedDB and restore last file if any
  await initDB();
  await loadLastSessionFile();

  // ✅ Wire up Save to Library button AFTER DOM loads
  const saveBtn = document.getElementById("save-to-library-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveFileToLibrary);
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
      setupUploadMultipleHandler();
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
            { id: "pitch-slider", tip: "Adjust voice pitch" },
            { id: "upload-multiple-btn", tip: "Select and upload multiple files to Library" }
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

// 4️⃣ UPLOAD MULTIPLE HANDLER
function setupUploadMultipleHandler() {
      const uploadBtn = document.getElementById("upload-multiple-btn");
      if (!uploadBtn) return;

      uploadBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = ".pdf,.epub,.txt,.docx,.doc,.pptx,.csv,.rtf,.msg,.sql,.webp,.xls,.xlsx,.xlsm,.xltx,.xltm,.tif,.eps,.tmp";
            input.style.display = "none";

            input.addEventListener("change", async (event) => {
                  const files = event.target.files;
                  if (!files.length) return;

                  for (const file of files) {
                        console.log("📁 Uploading:", file.name);

                        const reader = new FileReader();
                        reader.onload = () => {
                              const content = reader.result;
                              const displayName = file.name;

                              saveToLibrary(displayName, content);
                        };
                        reader.readAsText(file);
                  }
            });

            document.body.appendChild(input);
            input.click();
      });
}

function saveToLibrary(name, content) {
      const libraryList = document.getElementById("listen-library-list");
      const li = document.createElement("li");
      li.textContent = `${name} (uploaded)`;
      libraryList?.appendChild(li);
}


// =============================
// ✅ MODULE 6 — Advanced Queue, Favorites, Auto-Resume & UI Enhancements
// =============================

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
  if (!favContainer) {
    console.warn("⚠️ 'favorites-section' not found in DOM.");
    return;
  }

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
  const menuItems = menu.querySelectorAll("li");

  menu.style.top = `${event.clientY}px`;
  menu.style.left = `${event.clientX}px`;
  menu.classList.add("show");

  menuItems.forEach((li, i) => {
    li.style.animation = `fadeIn 0.3s ease ${i * 60}ms forwards`;
    li.tabIndex = 0;
  });

  setTimeout(() => menuItems[0]?.focus(), 50);

  menu.querySelector("#menu-play").onclick = () => playItem(itemId);
  menu.querySelector("#menu-add").onclick = () => addToPlaylist(itemId);
  menu.querySelector("#menu-download").onclick = () => downloadItem(itemId, type);
  menu.querySelector("#menu-fav").onclick = () => toggleFavorite(itemId);
  menu.querySelector("#menu-delete").onclick = () => deleteItem(itemId, type);

  menu.onkeydown = (e) => {
    const focused = document.activeElement;
    const items = [...menuItems];
    const currentIndex = items.indexOf(focused);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Escape") {
      hideContextMenu();
    }
  };

  menuItems.forEach(li => {
    li.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        li.click();
      }
    };
  });
}

function hideContextMenu() {
  const menu = document.getElementById("context-menu");
  menu.classList.remove("show");
  menu.style.top = "-9999px";
  menu.style.left = "-9999px";
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

/* --- Library Item Renderer --- */
function renderLibraryItem(item, type) {
  const container = document.getElementById(`${type}-library`);
  if (!container) {
    console.warn(`⚠️ Container #${type}-library not found.`);
    return;
  }

  const el = document.createElement("div");
  el.className = `library-item ${type}-item`;
  el.classList.add("theme-background", "theme-text");
  el.id = item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  el.setAttribute("data-tooltip", "Right-click or long-press for options");

  const textSpan = document.createElement("span");
  textSpan.className = "text-content";
  textSpan.textContent = item.name || "Untitled";

  el.appendChild(textSpan);
  container.appendChild(el);

  el.addEventListener("contextmenu", (e) => handleContextMenu(e, el.id, type));

  let pressTimer = null;
  el.addEventListener("touchstart", e => {
    pressTimer = setTimeout(() => handleContextMenu(e, el.id, type), 500);
  });
  el.addEventListener("touchend", () => clearTimeout(pressTimer));
}

/* --- Restore Library Items --- */
function restoreLibraryItems(type) {
  const storeName = "files";
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    const items = request.result.filter(f => f.category === type);
    const container = document.getElementById(`${type}-library`);
    if (!container) {
      console.warn(`⚠️ Container #${type}-library not found.`);
      return;
    }

    container.innerHTML = "";
    items.forEach(item => renderLibraryItem(item, type));

    log(`📚 Restored ${items.length} items in ${type} library.`);
  };

  request.onerror = () => {
    console.error("❌ Failed to restore library items.");
  };
}

/* --- Play Item (Context Aware) --- */
function playItem(itemId, onComplete = null) {
  const item = document.getElementById(itemId);
  if (!item) return;

  const type = item.classList.contains("listen-item") ? "listen" : "capture";
  const text = item.querySelector(".text-content")?.innerText || "";

  if (!text.trim()) {
    alert("This item has no text to play.");
    return;
  }

  localStorage.setItem("lastPlayedId", itemId);

  if (type === "capture") {
    const overwrite = document.getElementById("overwrite-capture-toggle")?.checked;
    const display = document.getElementById("capture-display");
    const existing = display?.textContent;

    if (!overwrite && existing?.trim()) {
      if (!confirm("Overwrite existing captured text?")) return;
    }

    navigate("capture");
    display.textContent = text;
  } else {
    navigate("listen");
    const display = document.getElementById("text-display");
    display.innerHTML = `<span class="sentence">${text}</span>`;
  }

  document.querySelectorAll(".library-item").forEach(el => el.classList.remove("playing", "finished"));
  item.classList.add("playing");

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = parseFloat(localStorage.getItem("rate") || 1);
  utterance.pitch = parseFloat(localStorage.getItem("pitch") || 1);
  utterance.voice = getSelectedVoice();

  utterance.onend = () => {
    item.classList.remove("playing");
    item.classList.add("finished");
    if (onComplete) onComplete();
  };

  utterance.onerror = () => {
    alert("Speech synthesis failed. Please try another voice or reload the page.");
    item.classList.remove("playing");
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}


/* --- Initialization --- */
window.addEventListener("DOMContentLoaded", () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  renderFavorites();
  loadAutoResumeSetting();
});


// Run after DOM is ready
//no longer needed      document.addEventListener("DOMContentLoaded", initializeContextMenus);

// =======================
// 📦 Module 7: Playlist Enhancements and Playback Features
// =======================

let playlist = [];

function loadPlaylist() {
  playlist = JSON.parse(localStorage.getItem("neurAloudPlaylist") || "[]");
  updatePlaylistUI();
}

function savePlaylist() {
  localStorage.setItem("neurAloudPlaylist", JSON.stringify(playlist));
}

function addToPlaylist(fileId) {
  if (!playlist.includes(fileId)) {
    playlist.push(fileId);
    savePlaylist();
    updatePlaylistUI();
  }
}

function removeFromPlaylist(fileId) {
  playlist = playlist.filter(id => id !== fileId);
  savePlaylist();
  updatePlaylistUI();
}

function reorderPlaylist(fromIndex, toIndex) {
  const item = playlist.splice(fromIndex, 1)[0];
  playlist.splice(toIndex, 0, item);
  savePlaylist();
  updatePlaylistUI();
}

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
      div.classList.add("dragging");
    };

    div.ondragend = () => {
      div.classList.remove("dragging");
    };

    div.ondragover = e => e.preventDefault();

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

function playFileById(fileId, callback) {
  const fileText = getFileTextById(fileId);
  if (!fileText) {
    alert("❌ Unable to play file.");
    return;
  }

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
    utter.rate = parseFloat(localStorage.getItem("rate") || 1);
    utter.pitch = parseFloat(localStorage.getItem("pitch") || 1);
    utter.voice = getSelectedVoice();
    speechSynthesis.speak(utter);
  };

  speakSentence();
}

function getFileNameById(id) {
  const files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  const found = files.find(f => f.id === id);
  return found ? found.name : null;
}

function getFileTextById(id) {
  const files = JSON.parse(localStorage.getItem("neurAloudLibrary") || "[]");
  const found = files.find(f => f.id === id);
  return found ? found.text : null;
}

window.addEventListener("DOMContentLoaded", loadPlaylist);


// =======================
// 📦 Module 8: Profile Customization & User Settings (Enhanced)
// =======================

const PROFILE_SETTINGS_KEY = "userProfileSettings";

const defaultProfileSettings = {
  theme: "light",
  ttsRate: 1.0,
  ttsPitch: 1.0,
  selectedVoice: "",
  autoResume: false,
  notificationTime: "18:30",
  language: "en-US",
  translationLanguage: "none",
  developerMode: false
};

function saveProfileSettings(settings) {
  localStorage.setItem(PROFILE_SETTINGS_KEY, JSON.stringify(settings));
}

function loadProfileSettings() {
  const stored = localStorage.getItem(PROFILE_SETTINGS_KEY);
  return stored ? JSON.parse(stored) : defaultProfileSettings;
}

function applyProfileSettings(settings) {
  try {
    if (settings.theme) setTheme(settings.theme);

    // Ensure a visible container exists for profile settings
    let container = document.getElementById("profile-settings");
    if (!container) {
      container = document.createElement("div");
      container.id = "profile-settings";
      container.style.marginTop = "2rem";
      document.body.appendChild(container);
    }

    // Helper: Create labeled input/select if missing
    const createLabeledElement = (id, label, type = "input", defaultValue = "") => {
      let el = document.getElementById(id);
      if (!el) {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "10px";

        const lbl = document.createElement("label");
        lbl.textContent = label;
        lbl.htmlFor = id;
        lbl.style.marginRight = "0.5rem";

        el = document.createElement(type);
        el.id = id;
        el.name = id;
        el.value = defaultValue;
        if (type === "input" && id.includes("toggle")) {
          el.type = "checkbox";
          el.checked = defaultValue;
        }

        wrapper.appendChild(lbl);
        wrapper.appendChild(el);
        container.appendChild(wrapper);

        console.warn(`⚠️ Auto-created #${id} with default value.`);
      }
      return el;
    };

    createLabeledElement("rate", "🗣️ TTS Rate:", "input", settings.ttsRate || "1.0").value = settings.ttsRate || "1.0";
    createLabeledElement("pitch", "🎵 Pitch:", "input", settings.ttsPitch || "1.0").value = settings.ttsPitch || "1.0";
    createLabeledElement("voice-select", "🎤 Voice:", "select", settings.selectedVoice || "").value = settings.selectedVoice || "";
    createLabeledElement("auto-resume-toggle", "🔁 Auto Resume:", "input", settings.autoResume || false).checked = settings.autoResume || false;
    createLabeledElement("language-select", "🌐 Language:", "select", settings.language || "").value = settings.language || "";
    createLabeledElement("translation-select", "🌎 Translate To:", "select", settings.translationLanguage || "").value = settings.translationLanguage || "";
    createLabeledElement("notification-time", "⏰ Notify At:", "input", settings.notificationTime || "").value = settings.notificationTime || "";

    document.body.dataset.developer = settings.developerMode ?? false;

  } catch (err) {
    console.error("❌ Failed to apply profile settings:", err);
  }
}


function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function toggleDeveloperMode() {
  const settings = loadProfileSettings();
  settings.developerMode = !settings.developerMode;
  saveProfileSettings(settings);
  applyProfileSettings(settings);
}

document.addEventListener("DOMContentLoaded", () => {
  const settings = loadProfileSettings();
  applyProfileSettings(settings);

  const saveBtn = document.getElementById("save-profile-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const settings = {
        theme: document.querySelector("input[name='theme']:checked")?.value || "light",
        ttsRate: parseFloat(document.getElementById("rate").value),
        ttsPitch: parseFloat(document.getElementById("pitch").value),
        selectedVoice: document.getElementById("voice-select").value,
        autoResume: document.getElementById("auto-resume-toggle").checked,
        notificationTime: document.getElementById("notification-time").value || "18:30",
        language: document.getElementById("language-select").value,
        translationLanguage: document.getElementById("translation-select").value,
        developerMode: document.body.dataset.developer === "true"
      };
      saveProfileSettings(settings);
      applyProfileSettings(settings);
      alert("✅ Profile settings saved.");
    });
  }
});

// ======================
// 📦 MODULE 9: Ads Integration and Management (Enhanced)
// ======================

const showAds = () => {
  const isPremium = localStorage.getItem("userPlan") === "premium";
  document.querySelectorAll(".ad-container").forEach(container => {
    container.style.display = isPremium ? "none" : "block";
  });
};

const initAds = () => {
  ["sidebar-ad", "footer-ad"].forEach(id => {
    const slot = document.getElementById(id);
    if (slot) slot.innerHTML = "<span class='ad-placeholder'>[Ad Placeholder]</span>";
  });
  showAds();
};

const displayConsentModal = () => {
  if (localStorage.getItem("adsConsent") !== "true") {
    const consent = confirm("We use ads to support the app. Continue?");
    localStorage.setItem("adsConsent", consent ? "true" : "false");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  displayConsentModal();
  initAds();
});

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key === "d") toggleAdDebug();
});

const toggleAdDebug = () => {
  const current = localStorage.getItem("adDebug") === "true";
  localStorage.setItem("adDebug", !current);
  alert("Ad Debug mode is now " + (!current ? "ON" : "OFF"));
};

// ========================
// 📦 Module 10: Floating Playback Panel (Cleaned)
// ========================

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

  // Controls
  document.getElementById("panel-close").onclick = () => panel.style.display = "none";
  document.getElementById("panel-play").onclick = playFloatingContent;
  document.getElementById("panel-pause").onclick = () => speechSynthesis.pause();
  document.getElementById("panel-stop").onclick = () => {
    speechSynthesis.cancel();
    updateTimer(0);
  };
  document.getElementById("panel-loop").onclick = toggleLoop;

  loadTTSEngines("floating");
  populateVoiceDropdown("floating");
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

// ==============================
// 🔤 Module 11: Auto-Translate (Preview Mode)
// ==============================
function autoTranslate(text, targetLang = "en") {
  // Stub logic: will be replaced by cloud translator APIs
  const placeholder = `[Translated to ${targetLang}]: ${text}`;
  showTranslatedText(placeholder);
}

function showTranslatedText(text) {
  const area = document.getElementById("translated-display");
  if (!area) return;
  area.textContent = text;
  area.classList.add("translated-flash");
  setTimeout(() => area.classList.remove("translated-flash"), 500);
}

function previewTranslationSelection() {
  const selection = window.getSelection().toString();
  if (selection.trim()) {
    const lang = document.getElementById("translation-lang")?.value || "en";
    autoTranslate(selection, lang);
  }
}

document.addEventListener("mouseup", () => {
  if (document.getElementById("preview-translate-toggle")?.checked) {
    previewTranslationSelection();
  }
});


// ==============================
// 📝 Module 12: Notes & Bookmarks (IndexedDB)
// ==============================
function initNotesAndBookmarksDB() {
  const request = indexedDB.open("neurAloudDB", 1);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("notes")) db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("bookmarks")) db.createObjectStore("bookmarks", { keyPath: "id", autoIncrement: true });
  };
}

function saveNote(fileId, content) {
  const req = indexedDB.open("neurAloudDB", 1);
  req.onsuccess = () => {
    const tx = req.result.transaction("notes", "readwrite");
    tx.objectStore("notes").add({ fileId, content, timestamp: new Date().toISOString() });
  };
}

function saveBookmark(fileId, position, label) {
  const req = indexedDB.open("neurAloudDB", 1);
  req.onsuccess = () => {
    const tx = req.result.transaction("bookmarks", "readwrite");
    tx.objectStore("bookmarks").add({ fileId, position, label, timestamp: new Date().toISOString() });
  };
}

function fetchUserNotesAndBookmarks(fileId, callback) {
  const req = indexedDB.open("neurAloudDB", 1);
  req.onsuccess = () => {
    const db = req.result;
    const txNotes = db.transaction("notes", "readonly").objectStore("notes").getAll();
    const txBookmarks = db.transaction("bookmarks", "readonly").objectStore("bookmarks").getAll();

    Promise.all([
      new Promise(res => txNotes.onsuccess = () => res(txNotes.result.filter(n => n.fileId === fileId))),
      new Promise(res => txBookmarks.onsuccess = () => res(txBookmarks.result.filter(b => b.fileId === fileId)))
    ]).then(([notes, bookmarks]) => callback({ notes, bookmarks }));
  };
}

document.getElementById("save-note-btn")?.addEventListener("click", () => {
  const content = prompt("📝 Enter your note:");
  if (content) saveNote(currentFileId, content);
});

document.getElementById("add-bookmark-btn")?.addEventListener("click", () => {
  const label = prompt("🔖 Label for this bookmark?");
  saveBookmark(currentFileId, currentPosition, label);
});

initNotesAndBookmarksDB();


// ==============================
// 📘 Module 13: Chapter Summary on Trigger
// ==============================
let chapterSummaryTriggered = false;

function monitorChapterEnd() {
  if (!sentences.length || currentSentenceIndex >= sentences.length) return;

  const current = sentences[currentSentenceIndex].trim().toLowerCase();
  const triggers = ["end of chapter", "chapter ends", "conclusion of chapter", "chapter complete"];
  const found = triggers.some(k => current.includes(k));

  if (found && !chapterSummaryTriggered) {
    chapterSummaryTriggered = true;
    generateChapterSummary(currentSentenceIndex);
  } else if (!found) {
    chapterSummaryTriggered = false;
  }
}

function generateChapterSummary(index) {
  const start = findChapterStart(index);
  const text = sentences.slice(start, index + 1).join(" ");
  const summary = summarizeChapter(text);
  displaySummary(summary);
  readSummaryAloud(summary);
}

function findChapterStart(index) {
  for (let i = index; i >= 0; i--) {
    if (sentences[i].toLowerCase().includes("chapter")) return i;
  }
  return 0;
}

function summarizeChapter(text) {
  // Placeholder - replace with LLM backend in future
  return `🧠 Summary: ${text.split(" ").slice(0, 30).join(" ")}...`;
}

function displaySummary(summary) {
  const box = document.createElement("div");
  box.className = "chapter-summary";
  box.textContent = summary;
  Object.assign(box.style, {
    padding: "10px",
    background: "#f9f9f9",
    border: "1px solid #ccc",
    margin: "10px 0"
  });
  (document.getElementById("text-display") || document.body).appendChild(box);
}

function readSummaryAloud(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = parseFloat(localStorage.getItem("rate") || 1);
  utter.pitch = parseFloat(localStorage.getItem("pitch") || 1);
  speechSynthesis.speak(utter);
}


// ==============================
// 🌐 Module 14: Saved Summaries & Quick Note Entry
// ==============================
function saveQuickSummary(text) {
  const key = `summary_${Date.now()}`;
  localStorage.setItem(key, text);
  alert("📚 Summary saved.");
}

function listSavedSummaries() {
  return Object.entries(localStorage)
    .filter(([k]) => k.startsWith("summary_"))
    .map(([k, v]) => ({ id: k, text: v }));
}

document.getElementById("save-summary-btn")?.addEventListener("click", () => {
  const display = document.getElementById("text-display");
  if (display?.textContent.trim()) {
    saveQuickSummary(display.textContent.trim());
  }
});


// ==============================
// 🌍 Module 15: Translation Modes & TTS Output
// ==============================
function translateWithPreview(text, fromLang = "auto", toLang = "en") {
  // Replace with cloud API like DeepL, Google Translate, etc.
  const translated = `[${fromLang} → ${toLang}] ${text}`;
  showTranslatedText(translated);
  speakTranslatedText(translated, toLang);
}

function speakTranslatedText(text, lang) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = parseFloat(localStorage.getItem("rate") || 1);
  utter.pitch = parseFloat(localStorage.getItem("pitch") || 1);
  speechSynthesis.speak(utter);
}

document.getElementById("translate-btn")?.addEventListener("click", () => {
  const text = document.getElementById("text-display")?.textContent.trim();
  const toLang = document.getElementById("translation-lang")?.value || "en";
  if (text) translateWithPreview(text, "auto", toLang);
});
