// =========================
// 📦 Merged Module 25: neurAloud_consolidated_script__to_24.js
// =========================

// =========================
// 📦 Merged Module 1: script.js
// =========================

// === Navigation Fix ===
window.navigate = function(id) {
  console.log("Navigating to:", id);
  document.querySelectorAll("main section").forEach(section =>
    section.classList.remove("active-section")
  );
  const target = document.getElementById(id);
  if (target) target.classList.add("active-section");
};


// 🧩 Module 1: File Load, Text Extraction, and Metadata Setup (Enhanced)

// Element bindings
const fileInput = document.getElementById("file-input");
const textDisplay = document.getElementById("text-display");
const logArea = document.getElementById("log-area");
// === API Keys ===
const GOOGLE_TTS_API_KEY = "AIzaSyBpZDvX3iKG0ZHqsEOWHr-JD6P-LkMNIxE";

// Safe logging function
const log = (...args) => console.log("📘", ...args);
let extractedText = "";
let sentences = [];
let currentSentenceIndex = 0;
let lastFileName = "";

let googleVoices = [];
let ibmVoices = [];
let localVoices = [];
let responsiveVoices = [];

// Example placeholders — replace with actual async voice loading if needed
/*googleVoices = [
  { name: "en-US-Standard-B", description: "Google US Male" },
  { name: "en-US-Standard-C", description: "Google US Female" }
];

ibmVoices = [
  { name: "en-US_AllisonV3Voice", description: "IBM Allison (US Female)" },
  { name: "en-GB_KateV3Voice", description: "IBM Kate (UK Female)" }
];*/
// ===============================
// 🔊 Voice Engine Globals & Flags
// ===============================
let currentEngine = "Google";
let allVoices = [];
let ibmQuotaUsed = 0;
let ibmQuotaLimit = 9500;
let isAdmin = false;  // Toggle true for testing or admin access

// ✅ SAFE DOM ELEMENT BINDINGS
const bindings = {
  // General
  fileInput: document.getElementById("file-input") ?? null,
  textDisplay: document.getElementById("text-display") ?? null,
  previewModal: document.getElementById("preview-modal") ?? null,
  modalClose: document.getElementById("modal-close") ?? null,
  modalText: document.getElementById("modal-text") ?? null,

  // Listen Section
  ttsEngineSelect: document.getElementById("tts-engine") ?? null,
  voiceSelect: document.getElementById("voice-select") ?? null,
  playBtn: document.getElementById("play-btn") ?? null,
  pauseBtn: document.getElementById("pause-btn") ?? null,
  stopBtn: document.getElementById("stop-btn") ?? null,
  loopBtn: document.getElementById("loop-btn") ?? null,
  saveToLibraryBtn: document.getElementById("save-to-library-btn") ?? null,
  rateSlider: document.getElementById("rate-slider") ?? null,
  pitchSlider: document.getElementById("pitch-slider") ?? null,
  rateValue: document.getElementById("rate-value") ?? null,
  pitchValue: document.getElementById("pitch-value") ?? null,
  playbackQueue: document.getElementById("playback-queue") ?? null,
  playAllBtn: document.getElementById("play-all") ?? null,
  exportTxtBtn: document.getElementById("export-txt") ?? null,
  exportJsonBtn: document.getElementById("export-json") ?? null,
  prevSentenceBtn: document.getElementById("prev-sentence") ?? null,
  nextSentenceBtn: document.getElementById("next-sentence") ?? null,

  // Library
  favoritesSection: document.getElementById("favorites-section") ?? null,
  favoritesList: document.getElementById("favorites-list") ?? null,
  listenLibraryGrid: document.querySelector("#listen-library.grid-library") ?? null,
  listenLibraryList: document.querySelector("#listen-library.library-list") ?? null,
  bulkDeleteListenBtn: document.getElementById("bulk-delete-listen-btn") ?? null,
  saveCapturedBtn: document.getElementById("save-captured-btn") ?? null,
  captureLibraryGrid: document.querySelector("#capture-library.grid-library") ?? null,
  captureLibraryList: document.querySelector("#capture-library.library-list") ?? null,
  bulkDeleteCaptureBtn: document.getElementById("bulk-delete-capture-btn") ?? null,
  overwriteCaptureToggle: document.getElementById("overwrite-capture-toggle") ?? null,
  clearLibraryBtn: document.querySelector("button[onclick='confirmClearLibrary()']") ?? null,
  clearFavoritesBtn: document.querySelector("button[onclick='confirmClearFavorites()']") ?? null,
  clearPlaylistBtn: document.querySelector("button[onclick='confirmClearPlaylist()']") ?? null,

  // Capture Section
  ttsEngineCapture: document.getElementById("tts-engine-capture") ?? null,
  voiceSelectCapture: document.getElementById("voice-select-capture") ?? null,
  playCaptureBtn: document.getElementById("play-capture-btn") ?? null,
  pauseCaptureBtn: document.getElementById("pause-capture-btn") ?? null,
  stopCaptureBtn: document.getElementById("stop-capture-btn") ?? null,
  loopCaptureBtn: document.getElementById("loop-capture-btn") ?? null,
  rateCaptureSlider: document.getElementById("rate-capture-slider") ?? null,
  pitchCaptureSlider: document.getElementById("pitch-capture-slider") ?? null,
  rateCaptureValue: document.getElementById("rate-capture-value") ?? null,
  pitchCaptureValue: document.getElementById("pitch-capture-value") ?? null,
  captureDisplay: document.getElementById("capture-display") ?? null,
  captureLanguageSelect: document.getElementById("capture-language") ?? null,
  readLanguageSelect: document.getElementById("read-language") ?? null,
  captureTranslateToggle: document.getElementById("capture-translate") ?? null,
  startCaptureBtn: document.getElementById("start-capture") ?? null,
  stopCaptureBtn: document.getElementById("stop-capture") ?? null,
  captureStatus: document.getElementById("capture-status") ?? null,

  // Profile / Settings
  themeSelect: document.getElementById("theme-select") ?? null,
  voiceAvatarSelect: document.getElementById("voice-avatar") ?? null,
  pitchSliderProfile: document.querySelector("#profile #pitch-slider") ?? null,
  pitchValueProfile: document.querySelector("#profile #pitch-value") ?? null,
  rateSliderProfile: document.querySelector("#profile #rate-slider") ?? null,
  rateValueProfile: document.querySelector("#profile #rate-value") ?? null,
  loopToggle: document.getElementById("loop-toggle") ?? null,
  autoResumeToggle: document.getElementById("auto-resume") ?? null,
  langReadSelect: document.getElementById("lang-read") ?? null,
  langTranslateSelect: document.getElementById("lang-translate") ?? null,
  enableTranslationToggle: document.getElementById("enable-translation") ?? null,
  totalListeningSpan: document.getElementById("total-listening") ?? null,
  chaptersCompletedSpan: document.getElementById("chapters-completed") ?? null,
  favoritesCountSpan: document.getElementById("favorites-count") ?? null,
  autoRewardToggle: document.getElementById("auto-reward-toggle") ?? null,
  nextRewardSpan: document.getElementById("next-reward") ?? null,
  manageSubscriptionBtn: document.getElementById("manage-subscription") ?? null,
  signOutBtn: document.getElementById("sign-out") ?? null,
  devModeToggle: document.getElementById("dev-mode-toggle") ?? null,

  // Developer
  viewLogsBtn: document.querySelector("button[onclick='viewLogs()']") ?? null,
  simulateFreeBtn: document.querySelector("button[onclick='simulateFree()']") ?? null,
  simulateTrialBtn: document.querySelector("button[onclick='simulateTrial()']") ?? null,
  simulatePremiumBtn: document.querySelector("button[onclick='simulatePremium()']") ?? null,

  // Context Menu
  contextMenu: document.getElementById("context-menu") ?? null,
  menuPlay: document.getElementById("menu-play") ?? null,
  menuAdd: document.getElementById("menu-add") ?? null,
  menuFav: document.getElementById("menu-fav") ?? null,
  menuDownload: document.getElementById("menu-download") ?? null,
  menuDelete: document.getElementById("menu-delete") ?? null,

  // Translation Tools
  languageInput: document.getElementById("language-input") ?? null,
  targetLanguageSelect: document.getElementById("target-language") ?? null,
  translationOutput: document.getElementById("translation-output") ?? null,
  autoInput: document.getElementById("auto-input") ?? null,
  autoTranslateOutput: document.getElementById("auto-translate-output") ?? null,
  summaryText: document.getElementById("summary-text") ?? null,
  summaryOutput: document.getElementById("summary-output") ?? null,
};


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

function toggleLoop() {
  isLooping = !isLooping;
  const loopBtn = document.getElementById("panel-loop");
  if (loopBtn) {
    loopBtn.classList.toggle("active", isLooping);
    loopBtn.title = isLooping ? "🔁 Looping Enabled" : "🔁 Looping Off";
    loopBtn.textContent = isLooping ? "🔁 Looping..." : "🔁 Loop";
  }
  console.log("🔁 Loop is now:", isLooping);
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



/* --- Initialization --- */
// ==============================
// 🧩 Utility: Persist Any Selection
// ==============================
function persistSelection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const type = el.type;

  if (type === "checkbox") {
    localStorage.setItem(id, el.checked);
    el.addEventListener("change", () => localStorage.setItem(id, el.checked));
  } else if (type === "range" || type === "select-one" || type === "text") {
    localStorage.setItem(id, el.value);
    el.addEventListener("input", () => localStorage.setItem(id, el.value));
  }
}

function restoreSelection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const val = localStorage.getItem(id);
  if (val === null) return;

  if (el.type === "checkbox") el.checked = val === "true";
  else el.value = val;
}


/***************************
 * MODULE 2: INIT + SETTINGS RESTORE
 ***************************/
async function fetchGoogleVoices() {
  try {
    const res = await fetch("https://texttospeech.googleapis.com/v1/voices?key=AIzaSyBpZDvX3iKG0ZHqsEOWHr-JD6P-LkMNIxE");
    const data = await res.json();
    if (!data.voices) throw new Error("Missing voices array");

    googleVoices = data.voices.map(v => ({
      name: v.name,
      description: `${v.name} (${v.languageCodes?.[0] || ""})`
    }));

    console.log(`✅ Google voices loaded: ${googleVoices.length}`);
  } catch (err) {
    console.error("❌ Google TTS load error:", err.message);
    googleVoices = [];
  }
}

async function fetchGoogleVoices() {
  const url = `https://texttospeech.googleapis.com/v1/voices?key=${GOOGLE_TTS_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    googleVoices = data.voices || [];
    console.log(`✅ Google voices loaded (${googleVoices.length})`);
  } catch (err) {
    console.error("❌ Failed to fetch Google voices:", err);
    googleVoices = [];
  }
}


function setupResponsiveVoice() {
  if (window._responsiveVoiceLoaded) return;
  window._responsiveVoiceLoaded = true;

  const script = document.createElement("script");
  script.src = "https://code.responsivevoice.org/responsivevoice.js?key=YOUR_KEY";
  document.body.appendChild(script);
}


// Global database reference
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);

    request.onerror = () => {
      console.error("❌ Failed to open IndexedDB.");
      reject("Failed to open DB");
    };

    request.onupgradeneeded = (e) => {
      db = e.target.result;
      console.log("⚙️ Upgrading DB structure...");

      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("✅ IndexedDB ready.");

      // Now safely count the files
      if (!db.objectStoreNames.contains("files")) {
        console.warn("⚠️ 'files' store not found even after success.");
        resolve();

      }

      const transaction = db.transaction("files", "readonly");
      const store = transaction.objectStore("files");
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count === 0) {
          console.log("📂 No files found in IndexedDB – skipping file load.");
        } else {
          console.log(`📂 Found ${count} file(s) in IndexedDB`);
          restoreLastSessionFile(); // Only call if files exist
        }
        resolve();
      };

      countRequest.onerror = () => {
        console.warn("⚠️ Could not count files in IndexedDB.");
        resolve(); // Still resolve to avoid blocking app
      };
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

  // Ensure DB is ready and file name is set
  if (!lastFileName || !db || !db.objectStoreNames.contains("files")) {
    log("ℹ️ Skipping session file load — no DB or file found.");

  }

  try {
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const req = store.getAll();

    req.onsuccess = async () => {
      const files = req.result;
      const lastFile = files.find(f => f.name === lastFileName && f.content);

      if (!lastFile) {
        log("⚠️ File not found in DB.");

      }

      log("📂 Restoring last loaded file: " + lastFile.name);
      extractedText = lastFile.content;
      sentences = extractedText.match(/[^.?!]*[.?!]/g) || [extractedText];
      currentSentenceIndex = parseInt(localStorage.getItem("currentSentenceIndex") || "0");

      if (textDisplay) {
        textDisplay.textContent = extractedText;
        highlightCurrentSentence();
      }
    };

    req.onerror = () => log("❌ Failed to retrieve files from IndexedDB.");
  } catch (err) {
    log("❌ loadLastSessionFile error: " + err.message);
  }
}

// ✅ Dynamically load TTS voices per engine and context
async function loadVoicesDropdown(engine = "local", context = "listen") {
  const dropdown = document.getElementById(
    context === "capture" ? "voice-select-capture" : "voice-select"
  );
  if (!dropdown) return;

  dropdown.innerHTML = "";
  let voices = [];

  try {
    switch (engine.toLowerCase()) {
      case "local":
        voices = speechSynthesis.getVoices();
        if (!voices.length) {
          console.warn("⚠️ Local voices not ready — retrying...");
          speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = speechSynthesis.getVoices();
            updateVoiceDropdown("local", updatedVoices, context);
          };
          return;
        } else {
          updateVoiceDropdown("local", voices, context);
          return;
        }

      case "google":
        // 🚫 Google Cloud TTS not implemented – skip for now
        console.warn("⚠️ Google TTS engine is disabled or not implemented.");
        return;

      case "ibm":
        voices = await fetchIBMVoices(context);
        break;

      case "responsivevoice":
        if (typeof responsiveVoice !== "undefined") {
          voices = responsiveVoice.getVoices();
        } else {
          console.warn("⚠️ responsiveVoice not defined or not loaded.");
          return;
        }
        break;

      default:
        console.warn(`⚠️ Unknown TTS engine: ${engine}`);
        return;
    }

    if (!Array.isArray(voices) || voices.length === 0) {
      console.warn(`❌ No voices found for engine: ${engine} (${context})`);
      return;
    }

    updateVoiceDropdown(engine, voices, context);
  } catch (err) {
    console.error(`🔥 Error loading voices for ${engine} → ${context}`, err);
  }
}


let responsiveVoiceLoaded = false;

function setupResponsiveVoice() {
  if (responsiveVoiceLoaded) return;
  responsiveVoiceLoaded = true;

  const script = document.createElement("script");
  script.src = "https://code.responsivevoice.org/responsivevoice.js?key=4KSLPhgK";
  script.onload = () => {
    const rvVoices = responsiveVoice.getVoices();
    updateVoiceDropdown("responsiveVoice", rvVoices, "capture");
    updateVoiceDropdown("responsiveVoice", rvVoices, "listen");
    console.log("✅ ResponsiveVoice loaded:", rvVoices.length, "voices");
  };
  document.body.appendChild(script);
}


function updateVoiceDropdown(engine, voices, context = "listen") {
  const dropdown = document.getElementById(`voice-${context}`);
  if (!dropdown) return;

  dropdown.innerHTML = "";

  if (!Array.isArray(voices) || voices.length === 0) {
    console.warn(`⚠️ No voices returned for ${engine} → ${context}`);

  }

  // Add voices
  voices.forEach(v => {
    const option = document.createElement("option");
    const value = v.name || v.voice || v.id || v;
    const label = v.description || v.displayName || value;
    option.value = value;
    option.textContent = label;
    dropdown.appendChild(option);
  });

  // Key to track per-engine voice preference
  const voiceKey = `voice-${engine.toLowerCase()}-${context}`;
  const savedVoice = localStorage.getItem(voiceKey);

  // Restore saved voice if it's in the current list
  if (savedVoice && [...dropdown.options].some(opt => opt.value === savedVoice)) {
    dropdown.value = savedVoice;
  } else {
    dropdown.selectedIndex = 0;
    localStorage.setItem(voiceKey, dropdown.value); // fallback to first
  }

  // Prevent multiple event listeners by clearing any existing ones
  const newDropdown = dropdown.cloneNode(true);
  dropdown.parentNode.replaceChild(newDropdown, dropdown);

  // Save preference on change
  newDropdown.addEventListener("change", () => {
    localStorage.setItem(voiceKey, newDropdown.value);
  });

  console.log(`✅ Voice dropdown updated for ${engine} → ${context}`);
}


function loadVoicesForEngine(engine, context) {
  const dropdown = document.getElementById(context === "capture" ? "voice-capture" : "voice-listen");
  if (!dropdown) return;

  let voices = [];

  if (engine === "local") {
    voices = speechSynthesis.getVoices();
  } else if (engine === "ibm") {
    voices = window.ibmVoices?.[context] || [];  // use scoped object
  } else if (engine === "responsivevoice") {
    voices = window.responsiveVoices?.[context] || [];
  }

  dropdown.innerHTML = "";
  voices.forEach(v => {
    const option = document.createElement("option");
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    dropdown.appendChild(option);
  });

  const savedVoice = localStorage.getItem(`voice-${context}`);
  if (savedVoice) dropdown.value = savedVoice;

  dropdown.addEventListener("change", e => {
    localStorage.setItem(`voice-${context}`, e.target.value);
  });
}


function loadInitialVoices() {
  const engineListen = document.getElementById("tts-engine-listen").value;
  const engineCapture = document.getElementById("tts-engine-capture").value;

  loadVoicesForEngine(engineListen, "listen");
  loadVoicesForEngine(engineCapture, "capture");

  setTimeout(() => {
    const savedVoiceListen = localStorage.getItem("voice-listen");
    const savedVoiceCapture = localStorage.getItem("voice-capture");

    if (savedVoiceListen) {
      const voice_listenEl = document.getElementById("voice-listen");
if (voice_listenEl) voice_listenEl.value = savedVoiceListen;
    }

    if (savedVoiceCapture) {
      const voice_captureEl = document.getElementById("voice-capture");
if (voice_captureEl) voice_captureEl.value = savedVoiceCapture;
    }
  }, 200); // Delay ensures dropdowns are populated
}


// ✅ Setup & persist engine dropdown, then load voices
async function loadTTSEngines(context = "listen") {
  const engineDropdown = document.getElementById(`tts-engine-${context}`);
  const voiceKey = `selectedVoice-${context}`;
  const engineKey = `selectedEngine-${context}`;

  if (!engineDropdown) return;

  // Clear and repopulate engine list
  engineDropdown.innerHTML = "";
  const engines = ["Google", "IBM", "ResponsiveVoice", "Local"];
  engines.forEach(engine => {
    const opt = document.createElement("option");
    opt.value = engine.toLowerCase();
    opt.textContent = engine;
    engineDropdown.appendChild(opt);
  });

  // Restore saved engine or default to google
  const savedEngine = localStorage.getItem(engineKey) || "google";
  engineDropdown.value = savedEngine;
  localStorage.setItem(engineKey, savedEngine);

  // Load voices for selected engine
  await loadVoicesDropdown(savedEngine, context);

  // When user changes engine
  engineDropdown.addEventListener("change", async () => {
    const selected = engineDropdown.value;
    localStorage.setItem(engineKey, selected);
    await loadVoicesDropdown(selected, context);  // ✅ await voice load
  });
}


async function fetchVoicesByEngine(engine, context) {
  switch (engine.toLowerCase()) {
    case "google":
    case "local":
      return new Promise(resolve => {
        const localVoices = speechSynthesis.getVoices();
        if (localVoices.length) return resolve(localVoices);
        speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
      });

    case "responsivevoice":
      return typeof responsiveVoice !== "undefined" ? responsiveVoice.getVoices() : [];

    case "ibm":
      try {
        return await fetchIBMVoices(context); // your custom function
      } catch (err) {
        console.warn("❌ IBM voice fallback:", err);
        return [
          { name: "en-US_MichaelV3Voice", lang: "en-US" },
          { name: "fr-FR_ReneeV3Voice", lang: "fr-FR" }
        ];
      }

    default:
      return [
        { name: "Test Voice 1", lang: "en" },
        { name: "Test Voice 2", lang: "en" }
      ];
  }
}


speechSynthesis.onvoiceschanged = () => {
  loadVoicesDropdown("google", "listen");
  loadVoicesDropdown("google", "capture");
};


// Render & Restore Listen and Capture Library items
function renderLibraryItem(item, type) {
  const container = document.getElementById(`${type}-library`);
  if (!container) {
    console.warn(`⚠️ Container #${type}-library not found.`);

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

    }

    container.innerHTML = ""; // Clear existing before restore
    items.forEach(item => renderLibraryItem(item, type));

    log(`📚 Restored ${items.length} items in ${type} library.`);
  };

  request.onerror = () => {
    console.error("❌ Failed to restore library items.");
  };
}


// ==============================
// 📊 Google TTS Character Quota
// ==============================

function getGoogleCharacterCount() {
  const stored = localStorage.getItem("googleTTSCharCount");
  return stored ? parseInt(stored, 10) : 0;
}

function updateGoogleCharacterCount(charsUsed) {
  const current = getGoogleCharacterCount();
  const updated = current + charsUsed;
  localStorage.setItem("googleTTSCharCount", updated);
}

function isGoogleTTSQuotaExceeded(limit = 3990000) {
  return getGoogleCharacterCount() >= limit;
}

function showQuotaWarning(limit = 3990000) {
  const used = getGoogleCharacterCount();
  const percent = ((used / limit) * 100).toFixed(2);
  console.warn(`📊 Google TTS Quota Used: ${used}/${limit} characters (${percent}%)`);
  
  const quotaDisplay = document.getElementById("google-quota-display");
  if (quotaDisplay) {
    quotaDisplay.textContent = `📊 Google TTS Used: ${used.toLocaleString()} / ${limit.toLocaleString()} (${percent}%)`;
    quotaDisplay.style.color = used > 0.9 * limit ? "red" : "#666";
  }
}

// ==============================
// 🔐 Safe Google TTS Call
// ==============================

async function safeGoogleTTS(text) {
  if (isGoogleTTSQuotaExceeded()) {
    alert("❌ Monthly Google TTS limit reached (3.99M characters). Please use another engine.");
    showQuotaWarning();
    return;
  }

  showQuotaWarning(); // Always show latest status
  await safeGoogleTTS(text); // Quota-safe wrapper
}

// ==============================
// 🔊 Google Cloud TTS Synthesizer
// ==============================

async function synthesizeWithGoogleTTS(text, voiceName = "en-US-Wavenet-D") {
  const apiKey = "AIzaSyBpZDvX3iKG0ZHqsEOWHr-JD6P-LkMNIxE";
  const requestBody = {
    input: { text },
    voice: {
      name: voiceName,
      languageCode: voiceName.split("-").slice(0, 2).join("-"),
    },
    audioConfig: { audioEncoding: "MP3" }
  };

  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    if (!result.audioContent) throw new Error("No audio content returned");

    updateGoogleCharacterCount(text.length); // Only update after success

    const audio = new Audio("data:audio/mp3;base64," + result.audioContent);
    audio.play();
  } catch (err) {
    console.error("❌ Google TTS synthesis failed:", err.message);
  }
}


// ===============================
// 🔁 Load All Voice Engines
// ===============================
function initializeTTS() {
  const tryLoad = () => {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) {
      console.warn("⏳ Voices not ready, retrying...");
      setTimeout(tryLoad, 300);
      return; // 🔴 Important: prevent proceeding on empty voices
    }

    ["listen", "capture"].forEach(context => {
      const dropdown = document.getElementById(`tts-engine-${context}`);
      if (!dropdown) return;

      const savedEngine = localStorage.getItem(`tts-engine-${context}`) || "local";
      dropdown.value = savedEngine;

      loadVoicesDropdown(savedEngine, context);
    });
  };

  // Run immediately and on voice list change
  tryLoad();
  speechSynthesis.onvoiceschanged = tryLoad;
}


// 🔊 Load local voices (Google/OS) for both Listen & Capture
function loadLocalVoices() {
  function populate(context = "listen") {
    const dropdown = document.getElementById(
      context === "capture" ? "voice-select-capture" : "voice-select"
    );
    if (!dropdown) return;

    const voices = speechSynthesis.getVoices();
    dropdown.innerHTML = "";

    voices.forEach(voice => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      dropdown.appendChild(opt);
    });

    const saved = localStorage.getItem(`voice-local-${context}`);
    if (saved) dropdown.value = saved;

    dropdown.addEventListener("change", () => {
      localStorage.setItem(`voice-local-${context}`, dropdown.value);
    });

    console.log(`✅ Local voices loaded (${voices.length}) for ${context}`);
  }

  if (speechSynthesis.getVoices().length) {
    ["listen", "capture"].forEach(populate);
  } else {
    speechSynthesis.onvoiceschanged = () => {
      ["listen", "capture"].forEach(populate);
    };
  }
}

// 🔌 Load ResponsiveVoice SDK
function setupResponsiveVoice(context = "listen") {
  const script = document.createElement("script");
  script.src = "https://code.responsivevoice.org/responsivevoice.js?key=4KSLPhgK";

  script.onload = () => {
    if (typeof responsiveVoice === "undefined") {
      console.warn("❌ ResponsiveVoice SDK failed to load");

    }

    const rvVoices = responsiveVoice.getVoices();
    if (!Array.isArray(rvVoices) || !rvVoices.length) {
      console.warn("❌ No ResponsiveVoice voices found.");

    }

    updateVoiceDropdown("responsiveVoice", rvVoices, context);
    console.log(`✅ ResponsiveVoice loaded (${rvVoices.length} voices) for ${context}`);
  };

  script.onerror = () => {
    console.error("❌ Failed to load ResponsiveVoice script.");
  };

  document.body.appendChild(script);
}


// 🌐 Fetch IBM Watson voices and update dropdown
async function fetchIBMVoices(context = "listen") {
  const ibmApiKey = "clMaAFKOaK9TDgy-u9X2O5lsgaeYDOqeqaDTtTULgk4_";
  const ibmUrl = "https://api.us-east.text-to-speech.watson.cloud.ibm.com/v1/voices";

  try {
    const res = await fetch(ibmUrl, {
      headers: {
        Authorization: "Basic " + btoa("apikey:" + ibmApiKey),
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (Array.isArray(data.voices)) {
      const voices = data.voices.map(v => ({
        name: v.name,
        description: `${v.name} (${v.language})`
      }));

      console.log("🎙 IBM Voices:", voices);  // 🔍 Log the actual list here
      updateVoiceDropdown("ibm", voices, context);
      console.log(`✅ IBM voices loaded (${voices.length}) for ${context}`);
    } else {
      console.warn("⚠️ IBM returned no voices:", data);
    }
  } catch (err) {
    console.error("❌ IBM TTS load error:", err);
  }
}


// ===========================
// 📣 ResponsiveVoice Integration
// ===========================

function fetchResponsiveVoices() {
  return new Promise(resolve => {
    if (window.responsiveVoice && responsiveVoice.getVoices) {
      const voices = responsiveVoice.getVoices();
      resolve(voices);
    } else {
      const script = document.createElement("script");
      script.src = "https://code.responsivevoice.org/responsivevoice.js";
      script.onload = () => resolve(responsiveVoice.getVoices());
      document.head.appendChild(script);
    }
  });
}


// ===========================
// 🌐 Dynamic Voice Engine Switching
// ===========================

["listen", "capture"].forEach(context => {
  const engineDropdown = document.getElementById(`tts-engine-${context}`);

  if (engineDropdown) {
    // 🔁 Restore previously selected engine
    const savedEngine = localStorage.getItem(`tts-engine-${context}`);
    if (savedEngine) engineDropdown.value = savedEngine;

    // 🎤 Load voices for the restored engine
    const currentEngine = engineDropdown.value?.toLowerCase();
    if (currentEngine === "google") {
      fetchGoogleVoices().then(() => loadVoicesForEngine("google", context));
    } else if (currentEngine === "ibm") {
      fetchIBMVoices(context);
    } else if (currentEngine === "responsivevoice") {
      fetchResponsiveVoices().then(rv => updateVoiceDropdown("responsivevoice", rv, context));
    } else {
      loadVoicesForEngine("local", context);
    }

    // 🎛 Handle engine selection change
    engineDropdown.addEventListener("change", async (e) => {
      const selectedEngine = e.target.value.toLowerCase();
      localStorage.setItem(`tts-engine-${context}`, selectedEngine);

      try {
        if (selectedEngine === "google") {
          await fetchGoogleVoices();
          loadVoicesForEngine("google", context);
        } else if (selectedEngine === "ibm") {
          await fetchIBMVoices(context);
        } else if (selectedEngine === "responsivevoice") {
          const rvVoices = await fetchResponsiveVoices();
          updateVoiceDropdown("responsivevoice", rvVoices, context);
        } else {
          loadVoicesForEngine("local", context);
        }
      } catch (err) {
        console.error(`❌ Failed to load voices for ${selectedEngine}:`, err);
        updateVoiceDropdown(selectedEngine, [], context); // fallback to empty
      }
    });
  }
});

// ===========================
// 🌐 ResponsiveVoice Integration (Real Fetching)
// ===========================


async function fetchResponsiveVoices() {
  try {
    if (typeof responsiveVoice !== "undefined" && typeof responsiveVoice.getVoices === "function") {
      const voices = responsiveVoice.getVoices();
      console.log(`✅ ResponsiveVoice loaded (${voices.length}) voices`);
      return voices;
    } else {
      throw new Error("responsiveVoice is not available or not ready");
    }
  } catch (error) {
    console.warn("⚠️ ResponsiveVoice voices could not be fetched:", error);
    return [];
  }
}

// ===========================
// 🛡️ Quota Management
// ===========================

let ibmUsageCount = parseInt(localStorage.getItem("ibmUsage") || "0", 10);

function canUseIBMVoice() {
  if (ibmUsageCount >= 9500) {
    alert("⚠️ IBM quota limit reached for this month. Please try again later or switch to another engine.");
    return false;
  }
  return true;
}

function incrementIBMUsage() {
  ibmUsageCount++;
  localStorage.setItem("ibmUsage", ibmUsageCount);
}

// Optional: Reset quota every 1st of month (UTC-based)
(function resetQuotaMonthly() {
  const lastReset = localStorage.getItem("ibmLastReset");
  const today = new Date().toISOString().slice(0, 10);
  if (lastReset !== today && new Date().getUTCDate() === 1) {
    localStorage.setItem("ibmUsage", "0");
    localStorage.setItem("ibmLastReset", today);
    ibmUsageCount = 0;
  }
})();


// ===========================
// 🌐 Fetch Voices from TTS APIs
// ===========================

async function fetchVoicesFromIBM() {
  const IBM_API_KEY = "clMaAFKOaK9TDgy-u9X2O5lsgaeYDOqeqaDTtTULgk4_";
  const IBM_URL = "https://api.us-east.text-to-speech.watson.cloud.ibm.com/instances/33e99dd5-b71e-4435-a65d-2e51b3a57dc5";
  const headers = {
    "Authorization": "Basic " + btoa("apikey:" + IBM_API_KEY),
    "Content-Type": "application/json"
  };

  try {
    const res = await fetch(`${IBM_URL}/v1/voices`, { headers });
    if (!res.ok) throw new Error("IBM API failed");
    const data = await res.json();
    return data.voices;
  } catch (err) {
    console.warn("⚠ IBM fetch failed:", err);
    return [];
  }
}

async function fetchVoicesFromResponsiveVoice() {
  try {
    const voices = [
      { name: "UK English Male" },
      { name: "US English Female" },
      { name: "Spanish Female" },
      { name: "French Female" }
    ];
    return voices;
  } catch (err) {
    console.warn("⚠ ResponsiveVoice fetch failed:", err);
    return [];
  }
}


// Place below fetchResponsiveVoices
// =============================
// 🎯 Engine-Based Voice Filter
// =============================
function bindTTSSelectors() {
  ["listen", "capture"].forEach(context => {
    const engineDropdown = document.getElementById(`tts-engine-${context}`);
    if (!engineDropdown) return;

    engineDropdown.addEventListener("change", async () => {
      const selected = engineDropdown.value.toLowerCase();
      localStorage.setItem(`selectedEngine-${context}`, selected);

      if (selected === "responsivevoice") {
        setupResponsiveVoice(context);
      } else {
        await loadVoicesDropdown(selected, context);
      }
    });
  });
}


// ===========================
// 🔒 Quota Control & Engine Lock
// ===========================

const QUOTA_LIMIT = 9500; // Set max at 9500/month for IBM

function checkQuota(engine) {
  const today = new Date();
  const monthKey = `${engine}-month-${today.getFullYear()}-${today.getMonth()}`;
  const usageKey = `${engine}-usage`;

  const savedMonth = localStorage.getItem(monthKey);
  const usage = parseInt(localStorage.getItem(usageKey)) || 0;

  if (!savedMonth) localStorage.setItem(monthKey, "true");
  if (today.getDate() === 1) localStorage.setItem(usageKey, "0");

  if (usage >= QUOTA_LIMIT) {
    alert(`⚠ ${engine} quota reached. Switching to Google.`);
    ["listen", "capture"].forEach(ctx => {
      localStorage.setItem(`selectedEngine-${ctx}`, "Google");
      const el = document.getElementById(`tts-engine-${ctx}`);
      if (el) el.value = "Google";
    });
    return false;
  }
  return true;
}

function incrementQuota(engine) {
  const usageKey = `${engine}-usage`;
  let usage = parseInt(localStorage.getItem(usageKey)) || 0;
  usage += 1;
  localStorage.setItem(usageKey, usage.toString());
}


// ===========================
// 🌍 Unified Voice Engine Switcher & Real Voice Loader
// ===========================

function switchVoiceEngine(context) {
  const engineSelect = document.getElementById(`tts-engine-${context}`);
  if (!engineSelect) return;
  const selectedEngine = engineSelect.value;
  localStorage.setItem(`selectedEngine-${context}`, selectedEngine);
  loadVoicesDropdown(selectedEngine, context);
}


// ===========================
// 🔐 Quota Enforcement Setup
// ===========================

const usageKey = "ttsUsageCount";
const quotaLimit = 9500;
function incrementTTSUsage() {
  let count = parseInt(localStorage.getItem(usageKey) || "0");
  count++;
  if (count >= quotaLimit) {
    alert("🚫 Daily TTS quota reached. Please try again tomorrow or upgrade your plan.");
    return false;
  }
  localStorage.setItem(usageKey, count);
  return true;
}

function resetQuotaDaily() {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem("quotaResetDate");
  if (lastReset !== today) {
    localStorage.setItem(usageKey, "0");
    localStorage.setItem("quotaResetDate", today);
  }
}

// Call this early during app init
resetQuotaDaily();

// ============= 🧪 TEST: IBM & ResponsiveVoice =============
function speakWithResponsiveVoice(text) {
  if (!incrementTTSUsage()) return;
  responsiveVoice.speak(text, undefined, {
    onstart: () => console.log("🔊 Speaking with ResponsiveVoice..."),
    onend: () => console.log("✅ Done with ResponsiveVoice.")
  });
}

function speakWithIBM(text, voice = "en-US_AllisonV3Voice") {
  if (!incrementTTSUsage()) return;
  fetch("/api/ibm/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice })
  })
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    })
    .catch(err => console.error("❌ IBM TTS Failed", err));
}

// ===========================
// 🧠 Initialize TTS System
// ===========================
function initializeTTS() {
  speechSynthesis.onvoiceschanged = () => {
    ["listen", "capture"].forEach(context => {
      const savedEngine = localStorage.getItem(`selectedEngine-${context}`) || "Google";
      const dropdown = document.getElementById(`tts-engine-${context}`);
      if (dropdown) dropdown.value = savedEngine;
      loadVoicesDropdown(savedEngine, context);
    });
  };
}

// ===========================
// 🌐 ResponsiveVoice SDK Integration
// ===========================

// 🧠 Load ResponsiveVoice voices dynamically (free SDK-based)
function loadResponsiveVoiceVoices(target = "listen") {
  if (typeof responsiveVoice === "undefined" || !responsiveVoice.getVoices) {
    console.warn("⚠ ResponsiveVoice SDK not loaded.");

  }

  const voices = responsiveVoice.getVoices();

  const dropdown = document.getElementById(
    target === "capture" ? "voice-select-capture" : "voice-select"
  );
  if (!dropdown) return;

  dropdown.innerHTML = "";
  voices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    dropdown.appendChild(option);
  });

  // Save and restore selected voice
  const saved = localStorage.getItem(`responsiveVoice-${target}`);
  if (saved) dropdown.value = saved;
  dropdown.addEventListener("change", () => {
    localStorage.setItem(`responsiveVoice-${target}`, dropdown.value);
  });
}

// 📦 Fallback voice if user doesn’t select any
function getSelectedResponsiveVoice(target = "listen") {
  const dropdown = document.getElementById(
    target === "capture" ? "voice-select-capture" : "voice-select"
  );
  return dropdown ? dropdown.value : "UK English Female";
}

// 🗣️ Speak using ResponsiveVoice
function speakWithResponsiveVoice(text, target = "listen") {
  const selectedVoice = getSelectedResponsiveVoice(target);
  responsiveVoice.speak(text, selectedVoice);
}

// ===========================
// 🌍 Dynamic Language Dropdown Setup
// ===========================

const availableModels = {
  "en-US":  { name: "English (US)",     engine: "CoquiTTS" },
  "de-DE":  { name: "German",           engine: "CoquiTTS" },
  "fr-FR":  { name: "French",           engine: "CoquiTTS" },
  "es-ES":  { name: "Spanish",          engine: "CoquiTTS" },
  "pt-BR":  { name: "Portuguese (BR)",  engine: "CoquiTTS" },
  "hi-IN":  { name: "Hindi",            engine: "CoquiTTS" },
  "zh-CN":  { name: "Chinese",          engine: "Mock" },
  "ja-JP":  { name: "Japanese",         engine: "Mock" },
  "ar-SA":  { name: "Arabic",           engine: "Mock" },
  "ru-RU":  { name: "Russian",          engine: "Mock" },
  "sw-KE":  { name: "Swahili",          engine: "Mock" },
  "ln-CD":  { name: "Lingala",          engine: "Mock" },
  "dua-CM": { name: "Douala",           engine: "Mock" }
};


function populateLanguageDropdown(context) {
  const dropdown = document.getElementById(`language-select-${context}`);
  if (!dropdown) return;

  dropdown.innerHTML = "";

  Object.entries(availableModels).forEach(([code, data]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${data.name} [${data.engine}]`;
    dropdown.appendChild(option);
  });

  // Restore previously selected language or default to en-US
  const savedLang = localStorage.getItem(`selectedLanguage-${context}`) || "en-US";
  dropdown.value = savedLang;
}

// ===========================
// 🚀 Dynamic Backend Integration Stub
// ===========================

function fetchTTSFromBackend(text, langCode) {
  const model = availableModels[langCode];
  if (!model) {
    alert("Unsupported language selected.");

  }

  fetch(`/api/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text, lang: langCode })
  })
    .then(res => res.blob())
    .then(blob => {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    })
    .catch(err => {
      console.error("TTS Error:", err);
    });
}

// ===========================
// 📌 Usage Example on UI Bind
// ===========================

function bindLanguageDropdown(selectId, buttonId, inputId) {
  const btn = document.getElementById(buttonId);
  btn.addEventListener("click", () => {
    const lang = document.getElementById(selectId).value;
    const text = document.getElementById(inputId).value;
    fetchTTSFromBackend(text, lang);
  });
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
  

  const currentContext = sectionId === "capture-panel" ? "capture" : "listen";
  const sentence = sentences[currentSentenceIndex];
  utterance = new SpeechSynthesisUtterance(sentence);

  if (currentContext === "listen") {
    utterance.rate = window.ttsRate || 1.0;
    utterance.pitch = window.ttsPitch || 1.0;
  } else if (currentContext === "capture") {
    utterance.rate = window.ttsRateCapture || 1.0;
    utterance.pitch = window.ttsPitchCapture || 1.0;
  }
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


// Setup for both Listen and Capture contexts
["listen", "capture"].forEach(context => {
  populateLanguageDropdown(`language-select-${context}`);
  bindLanguageDropdown(
    `language-select-${context}`,
    `speak-btn-${context}`,
    `tts-input-${context}`
  );
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

// ===============================
// MODULE 4C – Save to Listen Library with 100 Limit
// ===============================

async function saveFileToLibrary() {
  if (!extractedText || !lastFileName) {
    alert("No loaded file to save.");

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

// 2️⃣ BULK DELETE FROM LISTEN LIBRARY
function initializeBulkDeleteFeature() {
      const deleteButton = document.getElementById("delete-selected-listen-btn");
      const libraryContainer = document.getElementById("listen-library");

      if (!deleteButton || !libraryContainer) return;

      deleteButton.addEventListener("click", () => {
            const checkboxes = libraryContainer.querySelectorAll("input[type='checkbox']:checked");

            if (checkboxes.length === 0) {
                  alert("Please select at least one item to delete.");

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
  const auto_resume_toggleEl = document.getElementById("auto-resume-toggle");
if (auto_resume_toggleEl) auto_resume_toggleEl.checked = autoResume;
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

  }

  const sentences = fileText.match(/[^.!?]+[.!?]+/g) || [fileText];
  let index = 0;

  const speakSentence = () => {
    if (index >= sentences.length) {
      if (callback) callback();

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
    createLabeledElement("language-select", "🌐 Language:", "select", settings.language || "en").value = settings.language || "en";
    createLabeledElement("translation-select", "🌎 Translate To:", "select", settings.translationLanguage || "fr").value = settings.translationLanguage || "fr";


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
  loadVoicesDropdown("floating", "capture"); // or "listen", "capture"
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



// ============================== //
// ✅ DOMContentLoaded Consolidated Block
// ============================== //
document.addEventListener("DOMContentLoaded", async () => {
  // 🧠 Restore last visited section (Home, Listen, Capture, etc.)
  restoreSection();

  // ✅ Restore & persist all relevant UI controls
  const persistentIds = [
    "AI Explanation", "Capture Mode", "Image Description", "Translation",
    "auto-reward-toggle", "auto-resume", "autoplay-response", "dev-mode-toggle",
    "enable-translation", "lang-read", "lang-translate", "loop-toggle",
    "pitch-capture-slider", "pitch-slider", "rate-capture-slider", "rate-slider",
    "theme-select", "translation-lang", "tts-engine-capture", "tts-engine-listen",
    "voice-avatar", "voice-capture", "voice-listen"
  ];
  persistentIds.forEach(id => {
    restoreSelection(id);
    persistSelection(id);
  });

  // ✅ Pitch & Rate Sliders Setup
  const rateSlider = document.getElementById("rate-slider");
  const pitchSlider = document.getElementById("pitch-slider");
  const rateCaptureSlider = document.getElementById("rate-capture-slider");
  const pitchCaptureSlider = document.getElementById("pitch-capture-slider");

  // Load values from localStorage or use default
  window.ttsRate = parseFloat(localStorage.getItem("rate")) || 1.0;
  window.ttsPitch = parseFloat(localStorage.getItem("pitch")) || 1.0;
  window.ttsRateCapture = parseFloat(localStorage.getItem("rate-capture")) || 1.0;
  window.ttsPitchCapture = parseFloat(localStorage.getItem("pitch-capture")) || 1.0;

  // Update slider UI
  if (rateSlider) rateSlider.value = window.ttsRate;
  if (pitchSlider) pitchSlider.value = window.ttsPitch;
  if (rateCaptureSlider) rateCaptureSlider.value = window.ttsRateCapture;
  if (pitchCaptureSlider) pitchCaptureSlider.value = window.ttsPitchCapture;

  // Attach listeners
  rateSlider?.addEventListener("input", e => {
    window.ttsRate = parseFloat(e.target.value);
    localStorage.setItem("rate", window.ttsRate);
  });
  pitchSlider?.addEventListener("input", e => {
    window.ttsPitch = parseFloat(e.target.value);
    localStorage.setItem("pitch", window.ttsPitch);
  });
  rateCaptureSlider?.addEventListener("input", e => {
    window.ttsRateCapture = parseFloat(e.target.value);
    localStorage.setItem("rate-capture", window.ttsRateCapture);
  });
  pitchCaptureSlider?.addEventListener("input", e => {
    window.ttsPitchCapture = parseFloat(e.target.value);
    localStorage.setItem("pitch-capture", window.ttsPitchCapture);
  });

  // ✅ Restore Docking Station Mode
  const savedDockMode = localStorage.getItem("station-mode") || "normal";
  switch (savedDockMode) {
    case "expanded": expandStation(); break;
    case "docked": dockStation(); break;
    default: restoreToNormal();
  }

  // 🎛 Engine Switcher + Voice Loading
  ["listen", "capture"].forEach(context => {
    const engineDropdown = document.getElementById(`tts-engine-${context}`);
    if (engineDropdown) {
      engineDropdown.addEventListener("change", async (e) => {
        const selectedEngine = e.target.value.toLowerCase();
        localStorage.setItem(`tts-engine-${context}`, selectedEngine);

        try {
          if (selectedEngine === "google" || selectedEngine === "local") {
            loadVoicesDropdown(selectedEngine, context);
          } else if (selectedEngine === "ibm") {
            const ibmVoices = await fetchIBMVoices(context);
            updateVoiceDropdown("ibm", ibmVoices, context);
          } else if (selectedEngine === "responsivevoice") {
            const rvVoices = await fetchResponsiveVoices();
            updateVoiceDropdown("responsivevoice", rvVoices, context);
          }
        } catch (err) {
          console.error(`❌ Failed to load voices for ${selectedEngine}:`, err);
          updateVoiceDropdown(selectedEngine, [], context);
        }
      });
    }
  });

  // 🗣 Local TTS voice loading
  localVoices = speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    localVoices = speechSynthesis.getVoices();
    ["listen", "capture"].forEach(context => {
      const engine = document.getElementById(`tts-engine-${context}`)?.value?.toLowerCase();
      if (engine === "local") loadVoicesForEngine("local", context);
    });
  };

  // 🌐 ResponsiveVoice setup
  setupResponsiveVoice();

  // 🔁 Initial Engine-Based Voice Load
  await fetchGoogleVoices();
  await Promise.all(["listen", "capture"].map(async context => {
    const engine = document.getElementById(`tts-engine-${context}`)?.value?.toLowerCase();
    if (engine === "ibm") {
      await fetchIBMVoices(context);
    } else if (engine === "responsivevoice") {
      const rvVoices = await fetchResponsiveVoices();
      updateVoiceDropdown("responsivevoice", rvVoices, context);
    } else {
      loadVoicesForEngine(engine, context);
    }
  }));

  // 🌍 Restore Language Selection
  ["listen", "capture"].forEach(context => {
    const langDropdown = document.getElementById(`language-select-${context}`);
    const savedLang = localStorage.getItem(`selectedLanguage-${context}`) || "en-US";
    if (langDropdown) {
      langDropdown.value = savedLang;
      langDropdown.addEventListener("change", e => {
        localStorage.setItem(`selectedLanguage-${context}`, e.target.value);
      });
    }
  });

  // 📁 File Input Accept Types
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

  // 💾 Load File from IndexedDB
  await initDB();
  await loadLastSessionFile();
  if (db) restoreLastFileFromIndexedDB();

  // 📥 Save/Upload Hooks
  document.getElementById("save-to-library-btn")?.addEventListener("click", saveFileToLibrary);
  document.getElementById("upload-files-btn")?.addEventListener("change", event => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(isValidFile);
    if (validFiles.length !== files.length) alert("Some files were skipped.");
    validFiles.forEach(file => saveFileToLibrary(file));
  });

  // 🧹 Library Maintenance
  addCheckboxesToLibraryItems();
  setupBulkDeleteButton("bulk-delete-listen-btn", "listen-library");
  setupBulkDeleteButton("bulk-delete-capture-btn", "capture-library");
  initializeBulkDeleteFeature();
  addCheckboxesToLibrary();
  setupUploadMultipleHandler();

  // 👤 Profile Save Button
  document.getElementById("save-profile-btn")?.addEventListener("click", () => {
    const settings = {
      theme: document.querySelector("input[name='theme']:checked")?.value || "light",
      ttsRate: parseFloat(document.getElementById("rate").value),
      ttsPitch: parseFloat(document.getElementById("pitch").value),
      selectedVoice: document.getElementById("voice-select")?.value || "",
      autoResume: document.getElementById("auto-resume-toggle")?.checked || false,
      notificationTime: document.getElementById("notification-time")?.value || "18:30",
      language: document.getElementById("language-select")?.value || "en-US",
      translationLanguage: document.getElementById("translation-select")?.value || "en",
      developerMode: document.body.dataset.developer === "true"
    };
    saveProfileSettings(settings);
    applyProfileSettings(settings);
    alert("✅ Profile settings saved.");
  });

  // 🤖 Agent Panel & Docking
  createAgentPanel();
  createFloatingPlaybackPanel();

  // 🧠 Consent, Ads, Tooltips, Panels
  displayConsentModal();
  initAds();
  initFloatingPanel();
  applyTooltips();
  addTooltips();

  // 🎥 Capture Settings
  loadCaptureSettings();

  document.getElementById("captureToggleBtn")?.addEventListener("click", () => {
    if (isCapturing) stopCapture();
    else startCapture();
  });

  document.getElementById("captureLangSelect")?.addEventListener("change", e => {
    captureLanguage = e.target.value;
    saveCaptureSettings();
  });

  document.getElementById("translateCaptureToggle")?.addEventListener("change", e => {
    translateCapture = e.target.checked;
    saveCaptureSettings();
  });

  document.getElementById("captureTranslateLangSelect")?.addEventListener("change", e => {
    captureTranslatedLang = e.target.value;
    saveCaptureSettings();
  });

  // ▶️ Sample Playback Run
  const sentences = prepareSampleText();
  playSentences(sentences);
});


// ============================== //
// ✅ Restore Section on Reload
// ============================== //
function restoreSection() {
  const last = localStorage.getItem("lastSection") || "home";
  navigate(last);
}


function restoreToNormal() {
  const station = document.getElementById("floating-station");
  station.className = "station-mode-normal";
  station.innerHTML = `
    <div class="station-header">
      <span id="station-timer">4:12</span>
      <div>
        <button class="station-icon" onclick="dockStation()" title="Dock">🧲</button>
        <button class="station-icon" onclick="expandStation()" title="Expand">🔍</button>
      </div>
    </div>
    <div class="station-controls">
      <button onclick="document.getElementById('play-btn').click()">▶️</button>
      <button onclick="navigate('capture')" title="Capture">📸</button>
      <button onclick="alert('Bookmark saved!')" title="Bookmark">🔖</button>
    </div>`;
  localStorage.setItem("station-mode", "normal");
}


function expandStation() {
  const station = document.getElementById("floating-station");
  station.className = "station-mode-expanded";
  station.innerHTML = `
    <div class="station-header">
      <span id="station-timer">4:12</span>
      <button class="station-icon" onclick="restoreToNormal()" title="Close">✖</button>
    </div>
    <div class="station-controls">
      <button onclick="document.getElementById('play-btn').click()">▶️</button>
      <button onclick="navigate('capture')" title="Capture">📸</button>
      <button onclick="alert('Bookmark saved!')" title="Bookmark">🔖</button>
    </div>`;
  localStorage.setItem("station-mode", "expanded");
}


function dockStation() {
  const station = document.getElementById("floating-station");
  station.className = "station-mode-docked";
  station.innerHTML = `🎧`;
  station.title = "Undock";
  station.onclick = () => restoreToNormal();
  localStorage.setItem("station-mode", "docked");
}


// =========================
// 📦 Merged Module 2: module_16_capture_system (1).js
// =========================

// 📦 Module 16: Capture Tab – Live Audio Transcription & Description
// --------------------------------------------------------------
// Handles the real-time audio transcription, translation, and description
// from microphone input, including music/sound detection and saving.

let captureRecorder;
let captureChunks = [];
let isCapturing = false;
let captureLanguage = "en";
let translateCapture = false;
let captureTranslatedLang = "fr";

async function startCapture() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    captureRecorder = new MediaRecorder(stream);
    captureChunks = [];
    captureRecorder.ondataavailable = e => captureChunks.push(e.data);
    captureRecorder.onstop = async () => {
      const blob = new Blob(captureChunks, { type: 'audio/webm' });
      const text = await transcribeAudio(blob);
      let finalText = text;
      if (translateCapture) {
        finalText = await translateText(text, captureTranslatedLang);
      }
      displayCaptureText(finalText);
      saveCaptureItem(finalText);
    };
    captureRecorder.start();
    isCapturing = true;
    updateCaptureUI(true);
  } catch (e) {
    console.error("🎙️ Capture failed:", e);
    alert("Failed to start capture.");
  }
}

function stopCapture() {
  if (captureRecorder && isCapturing) {
    captureRecorder.stop();
    isCapturing = false;
    updateCaptureUI(false);
  }
}

async function transcribeAudio(blob) {
  // Placeholder: In production, send to external speech API
  return "Transcribed text from captured audio.";
}

function updateCaptureUI(active) {
  const btn = document.getElementById("captureToggleBtn");
  btn.textContent = active ? "🛑 Stop Capture" : "🎙️ Start Capture";
  document.getElementById("captureStatus").textContent = active ? "Capturing..." : "Idle";
}

function displayCaptureText(text) {
  const container = document.getElementById("captureOutput");
  const p = document.createElement("p");
  p.textContent = text;
  container.appendChild(p);
}

function saveCaptureItem(text) {
  const entry = {
    id: Date.now(),
    content: text,
    lang: captureLanguage,
    translated: translateCapture ? captureTranslatedLang : null
  };
  const store = getDBStore("captureStore", "readwrite");
  store.add(entry);
}

function loadCaptureSettings() {
  captureLanguage = localStorage.getItem("captureLanguage") || "en";
  captureTranslatedLang = localStorage.getItem("captureTranslatedLang") || "fr";
  translateCapture = localStorage.getItem("translateCapture") === "true";
}

function saveCaptureSettings() {
  localStorage.setItem("captureLanguage", captureLanguage);
  localStorage.setItem("captureTranslatedLang", captureTranslatedLang);
  localStorage.setItem("translateCapture", translateCapture);
}


// =========================
// 📦 Merged Module 3: module_17_stream_integration (1).js
// =========================

// ✅ Module 17 – Stream Integration & Live Reading Queue
// Description: Enable real-time stream-based reading (news, web articles, live feeds)

let streamReader = null;
let isStreaming = false;
let streamQueue = [];
let currentStreamIndex = 0;
let streamInterval = null;

// ✅ Start stream reading (simulate live content every X seconds)
function startStreamReading() {
  if (isStreaming || streamQueue.length === 0) return;
  isStreaming = true;
  updateStreamStatus("Streaming...");

  streamInterval = setInterval(() => {
    if (currentStreamIndex >= streamQueue.length) {
      stopStreamReading();

    }
    const currentText = streamQueue[currentStreamIndex];
    speakText(currentText, "stream");
    highlightStreamText(currentText);
    currentStreamIndex++;
  }, 7000); // Simulate new content every 7 seconds
}

// ✅ Stop streaming
function stopStreamReading() {
  isStreaming = false;
  clearInterval(streamInterval);
  updateStreamStatus("Stream Paused");
}

// ✅ Populate the stream queue with simulated live entries
function loadStreamQueue(mockArticles) {
  streamQueue = mockArticles;
  currentStreamIndex = 0;
  updateStreamStatus(`Loaded ${mockArticles.length} items`);
}

// ✅ Highlight the streamed text on the UI
function highlightStreamText(text) {
  const streamContainer = document.getElementById("stream-output");
  if (!streamContainer) return;
  streamContainer.innerText = text;
}

// ✅ Update status banner
function updateStreamStatus(msg) {
  const banner = document.getElementById("stream-status");
  if (banner) banner.innerText = msg;
}

// ✅ Simulated API Fetch (Replace with real RSS/News/Article Feed fetch)
function fetchLiveArticles() {
  const dummyArticles = [
    "Breaking: New discovery in quantum computing accelerates AI research.",
    "Live Update: Global leaders meet to discuss climate initiatives.",
    "Market Alert: Tech stocks rally after strong quarterly earnings.",
    "Event Stream: SpaceX prepares for another satellite launch.",
    "Trending Now: AI-generated films win accolades at international festival."
  ];
  loadStreamQueue(dummyArticles);
}

// ✅ Button Handlers
document.getElementById("start-stream-btn").addEventListener("click", startStreamReading);
document.getElementById("stop-stream-btn").addEventListener("click", stopStreamReading);
document.getElementById("fetch-stream-btn").addEventListener("click", fetchLiveArticles);

// ✅ Initialization
updateStreamStatus("Idle. Load stream to begin.");

// Required DOM elements assumed:
// - <div id="stream-output"></div>
// - <div id="stream-status"></div>
// - <button id="start-stream-btn">▶️ Start Stream</button>
// - <button id="stop-stream-btn">⏹ Stop</button>
// - <button id="fetch-stream-btn">📡 Load Stream</button>



// =========================
// 📦 Merged Module 4: module_18_translation_support (1).js
// =========================

// 📦 Module 18: Translation Support and Multilingual Playback

// 🌐 Planned Features:
// ✅ Translation Language Selector
// ✅ Toggle Translation On/Off
// ✅ Integration with TTS for Translated Output
// ✅ Persistence of Translation Settings
// ✅ Inline UI Integration in Listen & Capture Modes
// ✅ Fallback if Translation Fails

// 📘 Implemented Features Overview:
// Feature                             | Status | Description
// ---------------------------------- | ------ | ------------------------------------------------------------
// ✅ Translation Language Selector   | ✔️     | Dropdown to pick target translation language.
// ✅ Toggle Translation              | ✔️     | Button to enable/disable translation mode.
// ✅ Integrated with TTS             | ✔️     | Translated text passed to TTS engine for reading.
// ✅ Settings Persistence            | ✔️     | Saves translation toggle and language across sessions.
// ✅ UI Integration                  | ✔️     | Shows above text display area in Listen & Capture.
// ✅ Fallback Handling               | ✔️     | Shows error and reverts to original text if translation fails.

//let translationEnabled = false;
let targetLanguage = "fr"; // default to French

// 🌐 Initialize translation settings
function initTranslationSettings() {
    const savedEnabled = localStorage.getItem("translationEnabled");
    const savedLang = localStorage.getItem("targetLanguage");
    if (savedEnabled !== null) translationEnabled = savedEnabled === "true";
    if (savedLang) targetLanguage = savedLang;
    updateTranslationUI();
}

// 🌐 Toggle translation on/off
function toggleTranslation() {
    translationEnabled = !translationEnabled;
    localStorage.setItem("translationEnabled", translationEnabled);
    updateTranslationUI();
}

// 🌐 Set new target translation language
function setTranslationLanguage(lang) {
    targetLanguage = lang;
    localStorage.setItem("targetLanguage", lang);
}

// 🌐 Update UI elements to reflect translation state
function updateTranslationUI() {
    const toggleBtn = document.getElementById("toggle-translation");
    if (toggleBtn) {
        toggleBtn.textContent = translationEnabled ? "🌐 Translation: ON" : "🌐 Translation: OFF";
        toggleBtn.classList.toggle("active", translationEnabled);
    }
    const langSelect = document.getElementById("translation-language");
    if (langSelect) langSelect.value = targetLanguage;
}

// 🌐 Translate a sentence before reading
async function translateAndRead(sentence) {
    if (!translationEnabled || !targetLanguage || targetLanguage === "none") {
        speakSentence(sentence);

    }
    try {
        const translated = await translateText(sentence, targetLanguage);
        speakSentence(translated || sentence);
    } catch (err) {
        console.warn("Translation failed, reverting to original sentence:", err);
        speakSentence(sentence);
    }
}

// 🌐 Translation API logic
async function translateText(text, targetLang) {
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto"
              + `&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch translation");
    const data = await res.json();
    return data[0]?.map(t => t[0]).join("") || null;
}


// =========================
// 📦 Merged Module 5: module_19_chapter_summary (1).js
// =========================

// 📦 Module 19: End-of-Chapter Summary and Smart Cue
// Description: Automatically detects end of sections/chapters and reads out summaries.

let chapterEndRegex = /(Chapter|CHAPTER|Section|SECTION)\s+\d+\b|\b(Conclusion|Summary)\b/gi;
let autoSummarizeEnabled = true;

// 📌 Toggle switch to enable/disable chapter summary
function toggleAutoSummarize(enabled) {
  autoSummarizeEnabled = enabled;
  localStorage.setItem("autoSummarizeEnabled", enabled);
}

// 📌 Resume setting from storage
if (localStorage.getItem("autoSummarizeEnabled") === "false") {
  autoSummarizeEnabled = false;
}

// 📌 Detect chapter endings and summarize
function checkForChapterEndAndSummarize(currentSentence) {
  if (!autoSummarizeEnabled) return;

  if (chapterEndRegex.test(currentSentence)) {
    console.log("📘 End of chapter detected!");
    summarizeLastSection().then(summary => {
      if (summary) {
        readAloud(summary);
      }
    });
  }
}

// 📌 Summarize the last section
async function summarizeLastSection() {
  const sectionText = extractLastSectionText();
  if (!sectionText || sectionText.length < 100) return null;

  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sectionText }),
    });
    const data = await response.json();
    return "🔍 Summary: " + data.summary;
  } catch (error) {
    console.error("❌ Summarization failed:", error);
    return null;
  }
}

// 📌 Dummy extract function (replace with real logic)
function extractLastSectionText() {
  const history = document.getElementById("text-display").innerText;
  const sentences = history.split(/(?<=[.?!])\s+/);
  return sentences.slice(-10).join(" ");
}



// =========================
// 📦 Merged Module 6: module_20_bookmark_resume (1).js
// =========================

// 📌 Module 20: Advanced Auto Bookmarking + Resume Location Sync

let bookmarkStore;

function initBookmarkDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("neurAloudDB", 1);

    request.onsuccess = () => {
      bookmarkStore = request.result;
      resolve();
    };

    request.onerror = () => {
      reject("Bookmark DB failed to open.");
    };

    request.onupgradeneeded = (e) => {
      bookmarkStore = e.target.result;
      if (!bookmarkStore.objectStoreNames.contains("bookmarksStore")) {
        bookmarkStore.createObjectStore("bookmarksStore", { keyPath: "fileId" });
      }
    };
  });
}

function saveBookmark(fileId, sentenceIndex) {
  const transaction = bookmarkStore.transaction("bookmarksStore", "readwrite");
  const store = transaction.objectStore("bookmarksStore");
  store.put({ fileId, sentenceIndex });
}

function loadBookmark(fileId) {
  return new Promise((resolve) => {
    const transaction = bookmarkStore.transaction("bookmarksStore", "readonly");
    const store = transaction.objectStore("bookmarksStore");
    const request = store.get(fileId);

    request.onsuccess = () => {
      resolve(request.result ? request.result.sentenceIndex : 0);
    };

    request.onerror = () => {
      resolve(0);
    };
  });
}

function resumeFromBookmark(fileId) {
  loadBookmark(fileId).then((index) => {
    currentSentenceIndex = index || 0;
    if (sentences.length > 0 && currentSentenceIndex < sentences.length) {
      speakCurrentSentence();
      announce("🔁 Resuming from last location.");
    }
  });
}

function announce(text) {
  const speech = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(speech);
}

function onPauseOrStop(fileId) {
  if (typeof currentSentenceIndex !== "undefined") {
    saveBookmark(fileId, currentSentenceIndex);
  }
}

// Dev-only: Test resume manually
function testManualResume(fileId) {
  resumeFromBookmark(fileId);
}



// =========================
// 📦 Merged Module 7: module_21_multi_voice_dual_lang.js
// =========================

/* =====================================
   📦 Module 21 – Multi-Voice & Dual Language Playback
   ===================================== */

// ✅ Character-based voice playback
// ✔️ Assign different characters (Narrator, Person A, Person B) to distinct TTS voices.
const characterVoices = {
  narrator: { engine: "Google", voice: "en-US-Wavenet-D" },
  personA: { engine: "Google", voice: "en-US-Wavenet-F" },
  personB: { engine: "Google", voice: "en-GB-Wavenet-B" }
};

// ✅ Language toggling and dual narration
// ✔️ Allows user to toggle dual language read-aloud (e.g. English + Spanish).
let dualLanguageMode = false;
let secondaryLanguage = "es"; // e.g., Spanish
let dualVoice = { engine: "Google", voice: "es-ES-Standard-A" };

// ✅ Language mapping for phrase translation
const languagePairs = {
  en: {
    es: async (text) => await translateText(text, "es"),
    fr: async (text) => await translateText(text, "fr")
  }
};

// ✅ Translation and dual narration playback
async function playWithDualNarration(text, character = "narrator") {
  const primary = { text, ...characterVoices[character] };
  if (dualLanguageMode) {
    const translated = await languagePairs["en"][secondaryLanguage](text);
    const secondary = { text: translated, ...dualVoice };
    await playTTS(primary);
    await playTTS(secondary);
  } else {
    await playTTS(primary);
  }
}

// ✅ Simulated character-assigned dialog playback
async function simulateDialog(lines) {
  for (const line of lines) {
    await playWithDualNarration(line.text, line.character);
  }
}

// ✅ Sample structured input for dialogue
const sampleScript = [
  { character: "narrator", text: "Once upon a time in NeurAloud..." },
  { character: "personA", text: "Hey, have you tried this new voice feature?" },
  { character: "personB", text: "Yes! It's amazing. You can even switch languages." }
];

// ✅ Trigger demo dialog playback
document.getElementById("playDialogBtn")?.addEventListener("click", () => {
  simulateDialog(sampleScript);
});

// ✅ Update UI toggles
document.getElementById("toggleDualLang")?.addEventListener("change", (e) => {
  dualLanguageMode = e.target.checked;
});

document.getElementById("languageSelect")?.addEventListener("change", (e) => {
  secondaryLanguage = e.target.value;
});

// ✅ Reuse TTS and translate logic from previous modules
async function playTTS({ text, engine, voice }) {
  console.log(`Playing [${engine}] ${voice}:`, text);
  // Hook into specific TTS API logic here
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name === voice);
  speechSynthesis.speak(utterance);
}

async function translateText(text, lang) {
  console.log(`Translating to ${lang}:`, text);
  // Simulate translation (actual API calls should be done in backend/proxy)
  return `[${lang}] ${text}`;
}



// =========================
// 📦 Merged Module 8: module_22_rewards_notifications.js
// =========================

// 📦 Module 22 – Notification, Reward System, & Streak Tracker
// Total Lines: 112

let streakCount = 0;
let lastActiveDate = null;
let currentStreak = 0;
let rewardPoints = 0;

// 🕓 Load streak and reward data
function loadStreakData() {
  streakCount = parseInt(localStorage.getItem("streakCount")) || 0;
  rewardPoints = parseInt(localStorage.getItem("rewardPoints")) || 0;
  lastActiveDate = localStorage.getItem("lastActiveDate");
  if (lastActiveDate && isToday(lastActiveDate)) {
    currentStreak = streakCount;
  } else if (lastActiveDate && isYesterday(lastActiveDate)) {
    currentStreak = streakCount + 1;
    updateStreak();
  } else {
    currentStreak = 1;
    resetStreak();
  }
  updateStreakUI();
}

// 🧠 Check if same day
function isToday(dateStr) {
  const today = new Date().toDateString();
  return new Date(dateStr).toDateString() === today;
}

// ⏳ Check if yesterday
function isYesterday(dateStr) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return new Date(dateStr).toDateString() === yesterday.toDateString();
}

// 🔁 Update streak
function updateStreak() {
  streakCount = currentStreak;
  localStorage.setItem("streakCount", streakCount);
  localStorage.setItem("lastActiveDate", new Date().toISOString());
  rewardPoints += 10; // +10 points per day
  localStorage.setItem("rewardPoints", rewardPoints);
  showRewardPopup("+10 reward points earned!");
}

// 🧹 Reset streak
function resetStreak() {
  streakCount = 1;
  localStorage.setItem("streakCount", streakCount);
  localStorage.setItem("lastActiveDate", new Date().toISOString());
  rewardPoints += 5; // fallback reward
  localStorage.setItem("rewardPoints", rewardPoints);
  showRewardPopup("Streak restarted. +5 points");
}

// 📤 Update UI
function updateStreakUI() {
  const streakEl = document.getElementById("streak-count");
  const rewardEl = document.getElementById("reward-points");
  if (streakEl) streakEl.textContent = currentStreak;
  if (rewardEl) rewardEl.textContent = rewardPoints;
}

// 🎉 Show reward message
function showRewardPopup(message) {
  const popup = document.createElement("div");
  popup.className = "reward-popup";
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}

// 🔔 Daily Notification
function triggerDailyReminder() {
  if (Notification.permission === "granted") {
    new Notification("🧠 NeurAloud Reminder", {
      body: "Don’t forget to listen and boost your streak today!",
      icon: "icon.png"
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        triggerDailyReminder();
      }
    });
  }
}


// =========================
// 📦 Merged Module 9: module_23_analytics_insights.js
// =========================

// 📊 Module 23: Statistics, Analytics & Advanced Insights

// ✅ Initialize statistics data structure
const statisticsStore = "analyticsStats";
const defaultStats = {
  totalTimeListened: 0,     // in seconds
  totalFilesPlayed: 0,
  topFiles: {},             // filename -> count
  dailyListening: {},       // date -> seconds
  peakHour: null,
  favoriteVoice: null,
  preferredLanguage: null,
};

// ✅ Save stats to IndexedDB
function saveStats(stats) {
  const transaction = db.transaction([statisticsStore], "readwrite");
  const store = transaction.objectStore(statisticsStore);
  store.put({ key: "stats", value: stats });
}

// ✅ Load stats from IndexedDB
function loadStats(callback) {
  const transaction = db.transaction([statisticsStore], "readonly");
  const store = transaction.objectStore(statisticsStore);
  const request = store.get("stats");
  request.onsuccess = function () {
    callback(request.result ? request.result.value : defaultStats);
  };
}

// ✅ Update statistics after playback
function updatePlaybackStats(fileName, duration, voice, language) {
  loadStats(stats => {
    stats.totalTimeListened += duration;
    stats.totalFilesPlayed += 1;

    stats.topFiles[fileName] = (stats.topFiles[fileName] || 0) + 1;

    const today = new Date().toISOString().split("T")[0];
    stats.dailyListening[today] = (stats.dailyListening[today] || 0) + duration;

    const hour = new Date().getHours();
    stats.peakHour = (stats.peakHourCounts || {})[hour] = ((stats.peakHourCounts || {})[hour] || 0) + 1;
    stats.peakHour = Object.entries(stats.peakHourCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    stats.favoriteVoice = voice;
    stats.preferredLanguage = language;

    saveStats(stats);
  });
}

// ✅ Display stats in Profile section
function displayUserStats() {
  loadStats(stats => {
    const statDiv = document.getElementById("stats-display");
    statDiv.innerHTML = `
      <h3>📈 Usage Statistics</h3>
      <p>🕒 Total Time Listened: ${Math.floor(stats.totalTimeListened / 60)} minutes</p>
      <p>📁 Files Played: ${stats.totalFilesPlayed}</p>
      <p>🏆 Most Played File: ${Object.entries(stats.topFiles).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A"}</p>
      <p>📆 Top Listening Day: ${Object.entries(stats.dailyListening).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A"}</p>
      <p>⏰ Peak Listening Hour: ${stats.peakHour || "N/A"}:00</p>
      <p>🎤 Favorite Voice: ${stats.favoriteVoice || "N/A"}</p>
      <p>🌍 Preferred Language: ${stats.preferredLanguage || "N/A"}</p>
    `;
  });
}



// =========================
// 📦 Merged Module 10: module_24_voice_preview.js
// =========================

// 📦 Module 24 – Voice Preview Functionality

// Voice Preview Dropdown Integration
function loadVoicePreviewDropdown(ttsEngineId) {
  const voiceSelect = document.getElementById("voice-preview-select");
  voiceSelect.innerHTML = "";

  const voices = allVoices.filter(v => v.engine === ttsEngineId);
  for (const voice of voices) {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.language})`;
    voiceSelect.appendChild(option);
  }

  // Persist last selected preview voice
  const savedVoice = localStorage.getItem("previewVoice");
  if (savedVoice && voices.find(v => v.name === savedVoice)) {
    voiceSelect.value = savedVoice;
  }
}

// Voice Preview Playback
function previewVoice() {
  const selectedVoice = document.getElementById("voice-preview-select").value;
  const sampleText = document.getElementById("preview-sample").value.trim();
  if (!sampleText) {
    logMessage("⛔ Enter sample text to preview.");

  }

  const engine = localStorage.getItem("selectedEngine") || "Google";
  const voiceObj = allVoices.find(v => v.name === selectedVoice && v.engine === engine);
  if (!voiceObj) {
    logMessage("⚠️ Voice not available.");

  }

  const utter = new SpeechSynthesisUtterance(sampleText);
  utter.voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice);
  speechSynthesis.speak(utter);

  localStorage.setItem("previewVoice", selectedVoice);
  logMessage(`🔊 Previewing with ${selectedVoice}`);
}

// UI Hookup
function setupVoicePreviewUI() {
  const previewBox = document.getElementById("voice-preview-box");
  const previewBtn = document.getElementById("preview-button");
  const voiceDropdown = document.getElementById("voice-preview-select");

  previewBtn.addEventListener("click", previewVoice);
  voiceDropdown.addEventListener("change", e =>
    localStorage.setItem("previewVoice", e.target.value)
  );

  loadVoicePreviewDropdown(localStorage.getItem("selectedEngine") || "Google");
}



// =========================
// 📦 Merged Module 26: module_25_developer_mode2.js
// =========================

// ==========================
// Module 25 – Developer Mode & Admin Tools
// ==========================

let developerMode = false;
let simulatedUserRole = "free"; // Options: free, trial, premium
let devWhitelist = ["admin@neurAloud.com", "oscar.eta.jr@gmail.com"]; // Editable list

// Developer Dashboard UI
function createDevDashboard() {
  const dash = document.createElement("div");
  dash.id = "dev-dashboard";
  dash.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1e1e1e;
    color: #f0f0f0;
    padding: 12px;
    border-radius: 6px;
    z-index: 9999;
    width: 320px;
    font-family: monospace;
    box-shadow: 0 0 10px #000;
  `;
  dash.innerHTML = `
    <div style="margin-bottom: 8px;"><strong>🛠️ Developer Dashboard</strong></div>
    <label><input type="checkbox" id="dev-toggle" /> Enable Developer Mode</label><br><br>
    <label>User Role:
      <select id="dev-user-role">
        <option value="free">Free</option>
        <option value="trial">Trial</option>
        <option value="premium">Premium</option>
      </select>
    </label><br><br>
    <label><input type="checkbox" id="ab-switcher" /> A/B Test Group B</label><br><br>
    <button onclick="clearLogs()">🧹 Clear Logs</button>
    <button onclick="printLogs()">📋 Show Logs</button>
    <div id="dev-log-box" style="margin-top: 8px; font-size: 12px; max-height: 120px; overflow-y: auto; border: 1px solid #444; padding: 4px;"></div>
  `;
  document.body.appendChild(dash);

  // Hook up events
  document.getElementById("dev-toggle").onchange = (e) => {
    developerMode = e.target.checked;
    localStorage.setItem("developerMode", developerMode);
    devLog("Developer mode: " + (developerMode ? "ON" : "OFF"));
  };
  document.getElementById("dev-user-role").onchange = (e) => {
    simulatedUserRole = e.target.value;
    localStorage.setItem("simulatedRole", simulatedUserRole);
    devLog("User role set to: " + simulatedUserRole);
  };
  document.getElementById("ab-switcher").onchange = (e) => {
    localStorage.setItem("abGroup", e.target.checked ? "B" : "A");
    devLog("A/B Group set to: " + (e.target.checked ? "B" : "A"));
  };
}

// Logging
let devLogs = [];

function devLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  devLogs.push(`[\${timestamp}] \${message}`);
  const box = document.getElementById("dev-log-box");
  if (box) {
    box.innerText = devLogs.slice(-10).join("\n");
  }
}

function clearLogs() {
  devLogs = [];
  devLog("Logs cleared");
}

function printLogs() {
  console.clear();
  console.log("=== Developer Logs ===");
  devLogs.forEach((log) => console.log(log));
}

// Latency Tracker
function trackLatency(action, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  devLog(`⏱️ \${action} took \${duration.toFixed(2)} ms`);
  return result;
}

// Developer-only Access
function checkDeveloperAccess() {
  const user = localStorage.getItem("userEmail") || "";
  return devWhitelist.includes(user);
}

// Override Usage Limits
function getEffectiveUserRole() {
  if (developerMode) return "developer";
  return simulatedUserRole || "free";
}


// Override Function Example
function overrideQuotaIfDev(originalValue) {
  return developerMode ? Infinity : originalValue;
}

// Example use of simulated role
function isPremiumUser() {
  const role = getEffectiveUserRole();
  return role === "premium" || role === "developer";
}

// Usage hook
function canAccessFeature(featureName) {
  if (developerMode) return true;
  const role = getEffectiveUserRole();
  if (featureName === "upload") return role !== "free";
  if (featureName === "priorityTTS") return role === "premium";
  return false;
}

// Example Integration
function testAdminFeature() {
  if (!checkDeveloperAccess()) {
    alert("Access denied: Admins only.");

  }
  devLog("Admin-only feature executed.");
  alert("✅ Admin Feature Accessed.");
}



// =========================
// 📦 Merged Module 27: module_26_auto_scroll_centering.js
// =========================

// Module 26: Auto Scroll Highlight & Centering Enhancements

// Constants
const SCROLL_OFFSET_PERCENT = 0.8; // 80% from top

// Utility function to scroll sentence into view
function scrollSentenceIntoView(element) {
  if (!element) return;
  try {
    const container = document.getElementById('text-display');
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offsetTop = element.offsetTop;
    const containerScrollTop = container.scrollTop;
    const newScrollTop = offsetTop - container.clientHeight * SCROLL_OFFSET_PERCENT;

    container.scrollTo({
      top: newScrollTop,
      behavior: 'smooth'
    });
  } catch (err) {
    console.warn('Auto-scroll failed:', err);
  }
}

// Highlight and scroll the current sentence
function highlightCurrentSentence(index) {
  const allSpans = document.querySelectorAll('#text-display span');
  allSpans.forEach(span => span.classList.remove('highlight'));

  const current = allSpans[index];
  if (current) {
    current.classList.add('highlight');
    scrollSentenceIntoView(current);
  }
}

// Hook into existing speech synthesis logic
// let utterance;
// let currentSentenceIndex = 0;
let isPlaying = false;

function playSentences(sentences) {
  if (!sentences.length) return;

  function speakNext() {
    if (currentSentenceIndex >= sentences.length) return;

    utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
    highlightCurrentSentence(currentSentenceIndex);

    utterance.onend = () => {
      currentSentenceIndex++;
      if (isPlaying) speakNext();
    };

    speechSynthesis.speak(utterance);
  }

  isPlaying = true;
  currentSentenceIndex = 0;
  speakNext();
}

function pausePlayback() {
  speechSynthesis.pause();
  isPlaying = false;
}

function resumePlayback() {
  speechSynthesis.resume();
  isPlaying = true;
}

function stopPlayback() {
  speechSynthesis.cancel();
  isPlaying = false;
}

// Sample setup for testing
function prepareSampleText() {
  const container = document.getElementById('text-display');
  const text = "This is sentence one. This is sentence two. This is sentence three. This is sentence four.";
  const sentences = text.split('.').filter(Boolean).map(s => s.trim() + '.');
  container.innerHTML = '';

  sentences.forEach((sentence, idx) => {
    const span = document.createElement('span');
    span.textContent = sentence + ' ';
    span.setAttribute('data-index', idx);
    container.appendChild(span);
  });

  return sentences;
}


// =========================
// 📦 Merged Module 28: module_27_voice_control.js
// =========================

// ==========================
// Module 27 – Voice Navigation & Command Control
// ==========================

// User Settings
let voiceControlEnabled = true;
let wakeWord = "neur aloud";
// let isListening = false;
// let recognition, micIndicator, feedbackBox;

// Command Mapping
const commandActions = {
  play: () => playCurrentFile(),
  pause: () => pauseCurrentPlayback(),
  stop: () => stopPlayback(),
  resume: () => playCurrentFile(),
  next: () => loadNextFile(),
  back: () => loadPreviousFile(),
  "increase speed": () => adjustSpeed(0.1),
  "decrease speed": () => adjustSpeed(-0.1),
  "go to library": () => navigate("library"),
  "go home": () => navigate("home"),
  "show profile": () => navigate("profile"),
};

// Initialize Voice Recognition
function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition not supported");

  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = handleSpeechResult;
  recognition.onerror = (e) => console.warn("Voice Error:", e);
  recognition.onend = () => {
    if (voiceControlEnabled) {
      setTimeout(() => recognition.start(), 500);
    }
  };
}

// Start Listening
function startVoiceControl() {
  if (!recognition) return;
  isListening = true;
  recognition.start();
  showMicIndicator(true);
  showVoiceFeedback("🎙️ Voice control activated. Say “Neur Aloud” to start.");
}

// Stop Listening
function stopVoiceControl() {
  if (!recognition) return;
  isListening = false;
  recognition.stop();
  showMicIndicator(false);
  showVoiceFeedback("🔇 Voice control deactivated.");
}

// Handle Speech Result
function handleSpeechResult(event) {
  let transcript = "";
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      transcript += event.results[i][0].transcript.toLowerCase();
    }
  }

  if (!transcript.includes(wakeWord)) return;

  const cleaned = transcript.replace(wakeWord, "").trim();
  executeVoiceCommand(cleaned);
}

// Execute Matching Command
function executeVoiceCommand(phrase) {
  for (const command in commandActions) {
    if (phrase.includes(command)) {
      commandActions[command]();
      showVoiceFeedback(`🗣️ “${phrase}” → ✅ Executing: ${command}`);

    }
  }
  showVoiceFeedback(`⚠️ “${phrase}” → Unknown command.`);
}

// Speed Adjustment
function adjustSpeed(delta) {
  let newRate = parseFloat(document.getElementById("rateSlider")?.value || "1.0") + delta;
  newRate = Math.min(Math.max(newRate, 0.5), 2.0);
  document.getElementById("rateSlider").value = newRate.toFixed(2);
  saveSetting("rate", newRate);
  showVoiceFeedback(`⚙️ Rate adjusted to ${newRate.toFixed(2)}`);
}

// UI: Microphone Indicator
function showMicIndicator(active) {
  if (!micIndicator) {
    micIndicator = document.createElement("div");
    micIndicator.id = "mic-indicator";
    micIndicator.style = "position:fixed;bottom:16px;right:16px;width:40px;height:40px;border-radius:50%;background:#ff3c3c88;z-index:9999;box-shadow:0 0 8px red;";
    document.body.appendChild(micIndicator);
  }
  micIndicator.style.display = active ? "block" : "none";
}

// UI: Feedback Panel
function showVoiceFeedback(msg) {
  if (!feedbackBox) {
    feedbackBox = document.createElement("div");
    feedbackBox.id = "voice-feedback";
    feedbackBox.style = `
      position: fixed;
      bottom: 70px;
      right: 16px;
      background: #fff;
      color: #000;
      border: 1px solid #999;
      padding: 6px 10px;
      border-radius: 4px;
      box-shadow: 0 0 6px rgba(0,0,0,0.1);
      font-family: sans-serif;
      font-size: 14px;
      z-index: 9999;
      max-width: 250px;
    `;
    document.body.appendChild(feedbackBox);
  }
  feedbackBox.textContent = msg;
  clearTimeout(feedbackBox.timer);
  feedbackBox.timer = setTimeout(() => (feedbackBox.textContent = ""), 4000);
}

// Integration Hooks
function toggleVoiceControl(setting) {
  voiceControlEnabled = setting;
  saveSetting("voiceControl", setting);
  if (setting) startVoiceControl();
  else stopVoiceControl();
}


// Voice Commands Help
function printAvailableCommands() {
  console.log("🧠 Available Voice Commands:");
  for (let cmd in commandActions) {
    console.log(`→ "${cmd}"`);
  }
}



// =========================
// 📦 Merged Module 29: module_28_audio_enhancements.js
// =========================

// ==========================
// Module 28 – Audio Enhancements & Waveform Visuals
// ==========================

let audioContext, analyser, waveformCanvas, waveformCtx, dataArray, bufferLength, animationId;

// Setup Audio Visualization
function initAudioVisualizer(audioElementId = "tts-audio") {
  const audio = document.getElementById(audioElementId);
  if (!audio) return;

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const source = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 2048;

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Create Canvas
  if (!waveformCanvas) {
    waveformCanvas = document.createElement("canvas");
    waveformCanvas.id = "waveform-canvas";
    waveformCanvas.width = 500;
    waveformCanvas.height = 100;
    waveformCanvas.style = "width: 100%; height: 100px; display: block; background: #111; border-radius: 4px; margin-top: 10px;";
    document.body.appendChild(waveformCanvas);
  }

  waveformCtx = waveformCanvas.getContext("2d");

  drawWaveform();
}

function drawWaveform() {
  animationId = requestAnimationFrame(drawWaveform);

  analyser.getByteTimeDomainData(dataArray);

  waveformCtx.fillStyle = "#111";
  waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

  waveformCtx.lineWidth = 2;
  waveformCtx.strokeStyle = "#33ff33";

  waveformCtx.beginPath();

  const sliceWidth = waveformCanvas.width * 1.0 / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * waveformCanvas.height / 2;

    if (i === 0) {
      waveformCtx.moveTo(x, y);
    } else {
      waveformCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
  waveformCtx.stroke();
}

function stopWaveform() {
  cancelAnimationFrame(animationId);
  if (waveformCanvas) waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
}


// =========================
// 📦 Merged Module 30: module_30_session_analytics.js
// =========================

// ==========================
// Module 30 – Session Analytics & Smart Recommendations
// ==========================

let sessionData = [];
let recommendations = [];

function trackSessionEvent(eventType, details = {}) {
  const timestamp = new Date().toISOString();
  sessionData.push({ eventType, timestamp, ...details });

  if (sessionData.length > 1000) sessionData.shift(); // Prevent memory overflow
  saveSessionData();
}

function saveSessionData() {
  localStorage.setItem("sessionData", JSON.stringify(sessionData));
}

function loadSessionData() {
  const stored = localStorage.getItem("sessionData");
  if (stored) sessionData = JSON.parse(stored);
}

function analyzeUsagePatterns() {
  const usage = sessionData.reduce((acc, item) => {
    acc[item.eventType] = (acc[item.eventType] || 0) + 1;
    return acc;
  }, {});
  return usage;
}

function generateSmartRecommendations() {
  const usage = analyzeUsagePatterns();
  recommendations = [];

  if ((usage["play"] || 0) > 50 && !(usage["capture"] > 5)) {
    recommendations.push("Try capturing your own notes using the Capture feature!");
  }
  if ((usage["pause"] || 0) > (usage["play"] || 1)) {
    recommendations.push("Enable Auto Resume for smoother playback.");
  }
  if ((usage["upload"] || 0) > 30 && (usage["library"] || 0) < 10) {
    recommendations.push("Organize your uploads into playlists for quick access.");
  }

  localStorage.setItem("recommendations", JSON.stringify(recommendations));
}

function showRecommendations() {
  const box = document.getElementById("smart-recommend-box") || createRecommendBox();
  box.innerHTML = "<h4>🔍 Smart Recommendations</h4><ul>" + 
    recommendations.map(r => `<li>${r}</li>`).join("") + "</ul>";
}

function createRecommendBox() {
  const box = document.createElement("div");
  box.id = "smart-recommend-box";
  box.style = "position:fixed; bottom:20px; left:20px; background:#fff; color:#000; border-radius:8px; padding:12px; box-shadow:0 0 10px rgba(0,0,0,0.2); z-index:9999; max-width:300px;";
  document.body.appendChild(box);
  return box;
}


// =========================
// 📦 Merged Module 31: module_31_sentence_navigation.js
// =========================

// ==========================
// Module 31 – Interactive Visual Sentence & Paragraph Navigation
// ==========================

let currentHighlightIndex = 0;
let sentencePositions = [];

function highlightSentence(index) {
  const all = document.querySelectorAll(".highlighted-sentence");
  all.forEach(el => el.classList.remove("active-highlight"));

  const target = all[index];
  if (target) {
    target.classList.add("active-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function jumpToSentence(index) {
  currentHighlightIndex = index;
  highlightSentence(currentHighlightIndex);
}

function nextSentence() {
  if (currentHighlightIndex < sentencePositions.length - 1) {
    currentHighlightIndex++;
    highlightSentence(currentHighlightIndex);
  }
}

function previousSentence() {
  if (currentHighlightIndex > 0) {
    currentHighlightIndex--;
    highlightSentence(currentHighlightIndex);
  }
}

function extractSentencesFromText() {
  const textContainer = document.getElementById("text-display");
  const content = textContainer.innerText;
  const splitSentences = content.match(/[^.!?]+[.!?]+/g) || [content];

  textContainer.innerHTML = "";
  splitSentences.forEach((sentence, i) => {
    const span = document.createElement("span");
    span.innerText = sentence + " ";
    span.classList.add("highlighted-sentence");
    span.onclick = () => jumpToSentence(i);
    textContainer.appendChild(span);
    sentencePositions.push(span);
  });
}


// =========================
// 📦 Merged Module 32: module_33_notification_streaks.js
// =========================

// ==========================
// Module 33 – Notification & Streak Reminders
// ==========================

let reminderTime = "18:30"; // Default daily reminder time
//let streakCount = 0;
let lastUsedDate = null;

// Check & update streak
function updateStreak() {
  const today = new Date().toDateString();
  const last = localStorage.getItem("lastUsedDate");
  if (last !== today) {
    if (new Date(today) - new Date(last) === 86400000) {
      streakCount++;
    } else {
      streakCount = 1;
    }
    localStorage.setItem("lastUsedDate", today);
    localStorage.setItem("streakCount", streakCount);
    showNotification("🔥 Streak Updated!", `You're on a ${streakCount}-day streak!`);
  }
}

// Show local notification
function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  }
}

// Ask for permission
function requestNotificationPermission() {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

// Set daily reminder
function scheduleDailyReminder() {
  if ("serviceWorker" in navigator && "showTrigger" in Notification) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification("📚 Time to read with NeurAloud!", {
        body: "Keep your streak alive. Tap to resume.",
        tag: "daily-reminder",
      });
    });
  }
}


// ================================
// MODULE 35
// ================================

//==========================
//Module35–SocialSharing&PromotionPanel
//==========================
let shareLog = [];

function createSharePanel() {
  const panel = document.createElement("div");
  panel.id = "share-panel";
  panel.style = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--panel-bg, #f8f8f8);
    border: 1px solid var(--panel-border, #ccc);
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    width: 260px;
    font-family: sans-serif;
    font-size: 14px;
    transition: opacity 0.3s ease;
  `;

  panel.innerHTML = `
    <strong>📣 ShareNeurAloud</strong>
    <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
      ${createShareButtonHTML("📘", "Facebook")}
      ${createShareButtonHTML("🐦", "Twitter")}
      ${createShareButtonHTML("💼", "LinkedIn")}
      ${createShareButtonHTML("💬", "WhatsApp")}
      ${createShareButtonHTML("✉️", "Email")}
      ${createShareButtonHTML("🔗", "CopyLink")}
    </div>
    <div id="share-log" style="margin-top: 10px; font-size: 12px; color: #444;"></div>
    <div style="text-align: right; margin-top: 8px;">
      <button onclick="hideSharePanel()" style="font-size: 12px;">❌ Close</button>
    </div>
  `;

  document.body.appendChild(panel);
  updateShareLog();
}

function createShareButtonHTML(icon, label) {
  return `
    <button onclick="handleShare('${label}')" title="${label}" style="
      flex: 1 1 auto;
      padding: 6px;
      font-size: 16px;
      cursor: pointer;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: var(--btn-bg, #fff);
      color: #333;
    ">${icon}</button>
  `;
}

function handleShare(platform) {
  // Your sharing logic here
}
consturl=generateShareLink();
letshareURL="";
switch(platform.toLowerCase()){
case"facebook":
shareURL=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
break;
case"twitter":
shareURL=`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Try+NeurAloud!`;
break;
case"linkedin":
shareURL=`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
break;
case"whatsapp":
shareURL=`https://api.whatsapp.com/send?text=TryNeurAloud!${encodeURIComponent(url)}`;
break;
case"email":
shareURL=`mailto:?subject=CheckoutNeurAloud&body=Here'sthelink:${url}`;
break;
case"copylink":
navigator.clipboard.writeText(url).then(()=>{
logShare(platform+"(copied)");
alert("🔗Linkcopiedtoclipboard!");
});

default:

}
function handleShare(platform) {
  const shareURL = generateShareLink();
  window.open(shareURL, "_blank");
  logShare(platform);
}

function generateShareLink() {
  let base = window.location.href.split("?")[0];
  const fileName = localStorage.getItem("lastFileName") || "neurAloud";
  return `${base}?file=${encodeURIComponent(fileName)}&utm_source=NeurAloud&utm_medium=share&utm_campaign=organic`;
}

function logShare(platform) {
  const timestamp = new Date().toLocaleTimeString();
  shareLog.unshift(`[${timestamp}] ${platform}`);
  if (shareLog.length > 5) shareLog.pop();
  updateShareLog();
}

function updateShareLog() {
  const box = document.getElementById("share-log");
  if (!box) return;
  box.innerHTML = `<strong>Recent Shares:</strong><br>${shareLog.join("<br>")}`;
}

function hideSharePanel() {
  const panel = document.getElementById("share-panel");
  if (panel) panel.style.display = "none";
}
//Optionalauto-hideonscroll
letscrollTimeout;
window.addEventListener("scroll",()=>{
constpanel=document.getElementById("share-panel");
if(panel){
panel.style.opacity="0.3";
clearTimeout(scrollTimeout);
scrollTimeout=setTimeout(()=>(panel.style.opacity="1"),1500);
}
});
//Loadoninit


// ================================
// MODULE 36
// ================================

// ==========================
// Module 36 – Audiobook Mode & Chapter Navigation
// ==========================
let audiobookMode = false;
let chapters = [];
let currentChapterIndex = 0;
// Toggle Audiobook Mode
function toggleAudiobookMode(enable) {
  audiobookMode = enable;
  document.body.classList.toggle("audiobook-mode", enable);
  saveSetting("audiobookMode", enable);
  if (enable) {
    detectChapters();
    showChapterSidebar();
    resumeLastChapter();
  } else {
    removeChapterSidebar();
  }
}
// Detect Chapters from Visible Text
function detectChapters() {
  const fullText = document.getElementById("text-display")?.innerText || "";
  const chapterRegex = /(?:chapter\s+(\d+)[\s:\-]*(.*))|(?:^CHAPTER\s+(\d+).*)/gi;
  chapters = [];
  let match;
  while ((match = chapterRegex.exec(fullText))) {
    const index = match.index;
    const num = match[1] || match[3] || "";
    const title = match[2]?.trim() || "";
    const cleanTitle = `Chapter ${num}${title ? ` – ${title}` : ""}`;
    chapters.push({ index, title: cleanTitle });
  }
}
// Show Chapter Sidebar
function showChapterSidebar() {
  removeChapterSidebar();
  const sidebar = document.createElement("div");
  sidebar.id = "chapter-sidebar";
  sidebar.style = `
    position: fixed;
    top: 60px;
    left: 0;
    width: 220px;
    height: 100%;
    background: #202020;
    color: #fff;
    z-index: 9998;
    overflow-y: auto;
    border-right: 2px solid #444;
    font-family: sans-serif;
    font-size: 14px;
    padding: 10px;
  `;
  const title = document.createElement("div");
  title.textContent = "📖 Chapters";
  title.style = "font-weight: bold; margin-bottom: 10px;";
  sidebar.appendChild(title);
  chapters.forEach((ch, i) => {
    const item = document.createElement("div");
    item.textContent = ch.title;
    item.style = "margin: 6px 0; cursor: pointer;";
    item.onclick = () => scrollToChapter(i);
    sidebar.appendChild(item);
  });
  document.body.appendChild(sidebar);
}
// Remove Chapter Sidebar
function removeChapterSidebar() {
  const existing = document.getElementById("chapter-sidebar");
  if (existing) existing.remove();
}
// Scroll to Chapter
function scrollToChapter(index) {
  const container = document.getElementById("text-display");
  const content = container?.innerText || "";
  const targetIndex = chapters[index]?.index || 0;
  const preText = content.slice(0, targetIndex);
  const lines = preText.split("\n").length;
  const lineHeight = 20; // Approximate
  container.scrollTop = lines * lineHeight;
  currentChapterIndex = index;
  saveSetting("lastChapterIndex", index);
}
// Resume to Last Chapter
function resumeLastChapter() {
  const savedIndex = parseInt(loadSetting("lastChapterIndex") || 0);
  if (chapters[savedIndex]) {
    setTimeout(() => scrollToChapter(savedIndex), 1000);
  }
}
// Track Chapter Progress (optional enhancement)
function trackChapterProgress() {
  const container = document.getElementById("text-display");
  const progress = chapters.map((_, i) => {
    const pos = getScrollPositionForChapter(i);
    return pos;
  });
  localStorage.setItem("chapterProgress", JSON.stringify(progress));
}
function getScrollPositionForChapter(index) {
  const container = document.getElementById("text-display");
  return container?.scrollTop || 0;
}
// Mobile View: Chapter Dropdown
function showChapterDropdown() {
  const select = document.createElement("select");
  select.id = "chapter-dropdown";
  select.style = `
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 9999;
    padding: 6px;
    font-size: 14px;
  `;
  chapters.forEach((ch, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = ch.title;
    select.appendChild(opt);
  });
  select.onchange = (e) => scrollToChapter(parseInt(e.target.value));
  document.body.appendChild(select);
}
// Optional: Improve Chapter Titles
function improveChapterTitles() {
  chapters = chapters.map((ch, i) => {
    if (/chapter\s+\d+$/i.test(ch.title)) {
      return { ...ch, title: `${ch.title} – Untitled` };
    }
    return ch;
  });
}

// ================================
// MODULE 37
// ================================

// ==========================
// Module 37 – Auto Summary + Translation Memory
// ==========================
// GLOBALS
let summaryDB = {};
let translationMemory = {};
let lastSummaryText = "";
let summaryPanel;

// INIT STORAGE
function initSummaryDB() {
  const saved = localStorage.getItem("summaryDB");
  const translations = localStorage.getItem("translationMemory");
  summaryDB = saved ? JSON.parse(saved) : {};
  translationMemory = translations ? JSON.parse(translations) : {};
}
// SAVE STORAGE
function saveSummaryData() {
  localStorage.setItem("summaryDB", JSON.stringify(summaryDB));
  localStorage.setItem("translationMemory", JSON.stringify(translationMemory));
}
// CREATE PANEL
function createSummaryPanel() {
  summaryPanel = document.createElement("div");
  summaryPanel.id = "summary-panel";
  summaryPanel.style = `
    background: #f5f5f5;
    padding: 14px;
    border-radius: 6px;
    margin-top: 12px;
    border: 1px solid #ccc;
    font-family: sans-serif;
    font-size: 14px;
    line-height: 1.6;
    display: none;
  `;
  const container = document.getElementById("text-display") || document.body;
  container.appendChild(summaryPanel);
}
// BUTTON UI
function attachSummaryButton() {
  const btn = document.createElement("button");
  btn.textContent = "🧠 Auto-Summarize";
  btn.style = `
    margin-top: 12px;
    padding: 8px 14px;
    font-size: 14px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  btn.onclick = generateSummary;
  const target = document.getElementById("text-display") || document.body;
  target.appendChild(btn);
}
// SUMMARY GENERATOR
async function generateSummary() {
  const text = getTextForSummary();
  if (!text) return alert("No text available for summary.");
  if (summaryDB[text]) {
    showSummary(summaryDB[text]);

  }
  const summary = await mockSummarizeAPI(text);
  summaryDB[text] = summary;
  lastSummaryText = text;
  saveSummaryData();
  showSummary(summary);
}
// MOCK SUMMARIZER (Replace with real API)
async function mockSummarizeAPI(text) {
  const sentences = text.split(/[.!?]\s/).filter(s => s.length > 40);
  const summary = sentences.slice(0, 3).join(". ") + ".";
  await delay(1000);
  return summary;
}
// UI Display
function showSummary(summary) {
  summaryPanel.innerHTML = `
    <strong>📋 Summary:</strong><br>
    ${summary}
    <br><br>
    <label>Translate to:
      <select id="summary-lang-select">
        <option value="">(None)</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="pt">Portuguese</option>
        <option value="sw">Swahili</option>
        <option value="zh">Chinese</option>
        <option value="ar">Arabic</option>
      </select>
    </label>
    <button onclick="translateSummary()">🌍 Translate</button>
  `;
  summaryPanel.style.display = "block";
}
// TRANSLATE
async function translateSummary() {
  const lang = document.getElementById("summary-lang-select").value;
  if (!lang) return;
  if (translationMemory[lastSummaryText]?.[lang]) {
    showTranslatedSummary(translationMemory[lastSummaryText][lang], lang);

  }
  const translated = await mockTranslateAPI(lastSummaryText, lang);
  if (!translationMemory[lastSummaryText]) {
    translationMemory[lastSummaryText] = {};
  }
  translationMemory[lastSummaryText][lang] = translated;
  saveSummaryData();
  showTranslatedSummary(translated, lang);
}
// MOCK TRANSLATOR (Replace with real API)
async function mockTranslateAPI(text, lang) {
  await delay(1000);
  return `[${lang.toUpperCase()}] ${text.slice(0, 120)}...`;
}
// DISPLAY TRANSLATED TEXT
function showTranslatedSummary(translatedText, lang) {
  const langLabel = {
    fr: "French",
    es: "Spanish",
    pt: "Portuguese",
    sw: "Swahili",
    zh: "Chinese",
    ar: "Arabic"
  }[lang] || lang;
  summaryPanel.innerHTML += `
    <hr><strong>🔁 ${langLabel}:</strong><br>${translatedText}
  `;
}
// Helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function getTextForSummary() {
  const area = document.getElementById("text-display");
  return area?.innerText || "";
}
// ADMIN VIEW
function showSummaryDB() {
  console.clear();
  console.log("=== Summary DB ===");
  console.log(summaryDB);
  console.log("=== Translation Memory ===");
  console.log(translationMemory);
}

// ================================
// MODULE 38
// ================================

// ==========================
// Module 39 – Bookmarking System & Smart Resume
// ==========================
let bookmarks = [];
let currentFileId = null;
// Load bookmarks from IndexedDB
async function loadBookmarks(fileId) {
  const tx = db.transaction("bookmarks", "readonly");
  const store = tx.objectStore("bookmarks");
  const request = store.get(fileId);
  return new Promise((resolve) => {
    request.onsuccess = () => {
      bookmarks = request.result?.data || [];
      renderBookmarkList();
      resolve(bookmarks);
    };
    request.onerror = () => resolve([]);
  });
}
// Save bookmarks to IndexedDB
async function saveBookmarks(fileId) {
  const tx = db.transaction("bookmarks", "readwrite");
  const store = tx.objectStore("bookmarks");
  store.put({ id: fileId, data: bookmarks });
}
// Add new bookmark
function addBookmark(sentenceIndex, textPreview) {
  if (!currentFileId) return;
  const timestamp = Date.now();
  bookmarks.push({ index: sentenceIndex, preview: textPreview, time: timestamp });
  saveBookmarks(currentFileId);
  renderBookmarkList();
  console.log(`🔖 Bookmark added at index ${sentenceIndex}`);
}
// Render bookmarks in UI
function renderBookmarkList() {
  const container = document.getElementById("bookmark-list");
  if (!container) return;
  container.innerHTML = "";
  if (bookmarks.length === 0) {
    container.innerHTML = "<p>No bookmarks yet.</p>";

  }
  bookmarks.forEach((bm, idx) => {
    const div = document.createElement("div");
    div.className = "bookmark-item";
    div.innerHTML = `
      <strong>#${idx + 1}</strong>: ${bm.preview.slice(0, 100)}<br>
      <button onclick="goToBookmark(${bm.index})">📌 Go</button>
      <button onclick="removeBookmark(${idx})">❌ Delete</button>
    `;
    container.appendChild(div);
  });
}
// Remove a bookmark
function removeBookmark(index) {
  bookmarks.splice(index, 1);
  saveBookmarks(currentFileId);
  renderBookmarkList();
}
// Jump to bookmarked sentence
function goToBookmark(index) {
  if (sentences.length === 0) return;
  currentSentenceIndex = index;
  highlightSentence(index);
  scrollSentenceIntoView(index);
  console.log(`🎯 Jumped to bookmarked sentence ${index}`);
}
// Smart resume: Auto-jump to last bookmark
function resumeFromLastBookmark() {
  if (bookmarks.length === 0) return;
  const last = bookmarks[bookmarks.length - 1];
  goToBookmark(last.index);
}
// Update current reading progress as “smart resume point”
function updateResumePoint(index) {
  if (!currentFileId) return;
  localStorage.setItem(`resume_${currentFileId}`, index);
}
// Restore last resume point
function restoreResumePoint(fileId) {
  const idx = parseInt(localStorage.getItem(`resume_${fileId}`) || "0");
  currentSentenceIndex = isNaN(idx) ? 0 : idx;
  highlightSentence(currentSentenceIndex);
  scrollSentenceIntoView(currentSentenceIndex);
  console.log(`⏪ Resumed from index ${currentSentenceIndex}`);
}
// UI: Attach buttons
function setupBookmarkButtons() {
  const panel = document.getElementById("bookmark-panel");
  if (!panel) return;
  const addBtn = document.createElement("button");
  addBtn.textContent = "🔖 Add Bookmark";
  addBtn.onclick = () => {
    const idx = currentSentenceIndex;
    const preview = sentences[idx] || "";
    addBookmark(idx, preview);
  };
  panel.appendChild(addBtn);
}
// Hook into file load
async function onDocumentLoadWithBookmarks(fileId) {
  currentFileId = fileId;
  await loadBookmarks(fileId);
  restoreResumePoint(fileId);
}
// Hook into sentence advance
function onSentenceAdvance(index) {
  updateResumePoint(index);
}


// ================================
// MODULE 39
// ================================

// ==============================
// Module 40 – End-of-Chapter Summaries & Playback Triggers
// ==============================
let chapterSummaries = {};
let lastChapter = "";
let autoSummaryEnabled = true;
let autoPlaySummary = true;
// Helper: Detect end of chapter by sentence patterns
function detectEndOfChapter(text) {
  const patterns = [/^CHAPTER\s+\w+/i, /^###+/, /^[-=]{3,}$/];
  return patterns.some(p => p.test(text.trim()));
}
// Generate summary from previous sentences
function generateSummary(sentences, currentIdx, windowSize = 10) {
  const start = Math.max(0, currentIdx - windowSize);
  const segment = sentences.slice(start, currentIdx).join(" ");
  return summarizeText(segment);
}
// Placeholder for future LLM or backend
function summarizeText(text) {
  const words = text.split(" ");
  const brief = words.slice(0, 40).join(" ");
  return `📝 Summary: ${brief}...`;
}
// Handle end-of-chapter event
function handleEndOfChapter(sentenceIndex) {
  const chapterId = `Chapter_${Object.keys(chapterSummaries).length + 1}`;
  const summary = generateSummary(sentences, sentenceIndex);
  chapterSummaries[chapterId] = {
    id: chapterId,
    summary: summary,
    idx: sentenceIndex
  };
  console.log(`📘 ${chapterId} summary generated.`);
  renderSummaryUI();
  if (autoPlaySummary) {
    speak(summary);
  }
}
// Hook into sentence reading loop
function monitorForChapterEnds(index) {
  const sentence = sentences[index] || "";
  if (detectEndOfChapter(sentence)) {
    if (lastChapter !== sentence) {
      lastChapter = sentence;
      setTimeout(() => {
        handleEndOfChapter(index);
      }, 1000);
    }
  }
}
// Speak the text aloud using current TTS
function speak(text) {
  if (!text || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = parseFloat(localStorage.getItem("ttsRate") || 1);
  utter.pitch = parseFloat(localStorage.getItem("ttsPitch") || 1);
  speechSynthesis.speak(utter);
}
// Show summaries in side panel
function renderSummaryUI() {
  let container = document.getElementById("summary-panel");
  if (!container) {
    container = document.createElement("div");
    container.id = "summary-panel";
    container.style = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 300px;
      max-height: 300px;
      overflow-y: auto;
      background: #fefefe;
      border: 1px solid #aaa;
      padding: 10px;
      font-size: 13px;
      box-shadow: 0 0 10px #888;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }
  container.innerHTML = `<h4>🧠 Chapter Summaries</h4>`;
  Object.values(chapterSummaries).forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s.id;
    btn.onclick = () => {
      highlightSentence(s.idx);
      scrollSentenceIntoView(s.idx);
      speak(s.summary);
    };
    container.appendChild(btn);
    container.appendChild(document.createTextNode(" "));
  });
}
// Toggle options
function setupSummarySettings() {
  const bar = document.getElementById("summary-settings");
  if (!bar) {
    const newBar = document.createElement("div");
    newBar.id = "summary-settings";
    newBar.style = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: #eee;
      border: 1px solid #ccc;
      padding: 10px;
      font-size: 12px;
      z-index: 9999;
    `;
    newBar.innerHTML = `
      <label><input type="checkbox" id="auto-summary-toggle" checked /> Auto Summaries</label><br>
      <label><input type="checkbox" id="auto-play-toggle" checked /> Auto Play</label>
    `;
    document.body.appendChild(newBar);
    document.getElementById("auto-summary-toggle").onchange = e => {
      autoSummaryEnabled = e.target.checked;
    };
    document.getElementById("auto-play-toggle").onchange = e => {
      autoPlaySummary = e.target.checked;
    };
  }
}

// ================================
// MODULE 40
// ================================

// ==============================
// Module 41 – Looping Modes & Sentence Repeat
// ==============================
let loopMode = "none"; // "none", "sentence", "paragraph", "range"
let loopActive = false;
let loopStart = 0;
let loopEnd = 0;
let lastSentenceIndex = 0;
function repeatSentence() {
  if (sentences[lastSentenceIndex]) {
    speak(sentences[lastSentenceIndex]);
  }
}
function getParagraph(index) {
  let para = [sentences[index]];
  let i = index - 1;
  while (i >= 0 && !sentences[i].match(/^\s*$/)) {
    para.unshift(sentences[i]);
    i--;
  }
  i = index + 1;
  while (i < sentences.length && !sentences[i].match(/^\s*$/)) {
    para.push(sentences[i]);
    i++;
  }
  return para.join(" ");
}
function loopPlayback(index) {
  if (!loopActive || loopMode === "none") return;
  if (loopMode === "sentence") {
    speak(sentences[index]);
  } else if (loopMode === "paragraph") {
    const paraText = getParagraph(index);
    speak(paraText);
  } else if (loopMode === "range") {
    if (index >= loopEnd) {
      currentSentenceIndex = loopStart - 1;
    }
  }
}
function setLoopRange(start, end) {
  loopStart = start;
  loopEnd = end;
  localStorage.setItem("loopStart", loopStart);
  localStorage.setItem("loopEnd", loopEnd);
  devLog(`Custom loop set: ${loopStart} to ${loopEnd}`);
}
function toggleLoopMode(mode) {
  loopMode = mode;
  loopActive = mode !== "none";
  localStorage.setItem("loopMode", loopMode);
  devLog(`Loop mode set: ${loopMode}`);
  updateLoopPanel();
}
function restoreLoopSettings() {
  loopMode = localStorage.getItem("loopMode") || "none";
  loopStart = parseInt(localStorage.getItem("loopStart") || "0");
  loopEnd = parseInt(localStorage.getItem("loopEnd") || "0");
  loopActive = loopMode !== "none";
}
function updateLoopPanel() {
  const panel = document.getElementById("loop-panel");
  if (panel) {
    panel.querySelector("#loop-status").innerText = `Mode: ${loopMode}`;
  }
}
function createLoopPanel() {
  if (document.getElementById("loop-panel")) return;
  const panel = document.createElement("div");
  panel.id = "loop-panel";
  panel.style = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: #f1f1f1;
    border: 1px solid #888;
    padding: 10px;
    font-size: 13px;
    z-index: 9999;
    box-shadow: 0 0 5px #aaa;
  `;
  panel.innerHTML = `
    <div><strong>🔁 Loop Control</strong></div>
    <div id="loop-status">Mode: ${loopMode}</div>
    <button onclick="toggleLoopMode('none')">❌ Off</button>
    <button onclick="toggleLoopMode('sentence')">🔂 Sentence</button>
    <button onclick="toggleLoopMode('paragraph')">📄 Paragraph</button>
    <button onclick="toggleLoopMode('range')">📌 Range</button>
    <button onclick="repeatSentence()">Repeat 🔁</button>
    <br><br>
    <input type="number" id="loop-start" placeholder="Start ID" style="width: 60px" />
    <input type="number" id="loop-end" placeholder="End ID" style="width: 60px" />
    <button onclick="setLoopFromInputs()">Set Range</button>
  `;
  document.body.appendChild(panel);
}
function setLoopFromInputs() {
  const start = parseInt(document.getElementById("loop-start").value || "0");
  const end = parseInt(document.getElementById("loop-end").value || "0");
  if (start < end) {
    setLoopRange(start, end);
  } else {
    alert("Start must be less than end");
  }
}
function onSentenceChangeLoopHook(index) {
  lastSentenceIndex = index;
  if (loopActive) {
    loopPlayback(index);
  }
}


// ================================
// MODULE 41
// ================================

// ==========================
// Module 42 – Sleep Timer, Idle Timeout & Auto Pause
// ==========================
let sleepTimer = null;
let idleTimer = null;
let idleTimeoutMs = 2 * 60 * 1000;
let sleepCountdown = 0;
let sleepInterval = null;
let autoPauseOnBlur = true;
// Create Sleep/Idle Panel
function createSleepPanel() {
  const panel = document.createElement("div");
  panel.id = "sleep-panel";
  panel.style = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #fff7e6;
    border: 1px solid #888;
    padding: 10px;
    font-size: 13px;
    z-index: 9999;
    box-shadow: 0 0 5px #aaa;
  `;
  panel.innerHTML = `
    <div><strong>⏰ Sleep/Idle Controls</strong></div>
    <label>Sleep Timer (min):
      <select id="sleep-time">
        ${[5,10,15,30,45,60,90].map(min => `<option value="${min}">${min}</option>`).join("")}
      </select>
    </label>
    <button onclick="startSleepTimer()">Start</button>
    <button onclick="cancelSleepTimer()">Cancel</button>
    <br><br>
    <label><input type="checkbox" id="pause-on-blur" checked /> Pause on Tab Blur</label>
    <div id="sleep-status" style="margin-top: 6px; font-size: 12px;">Idle...</div>
  `;
  document.body.appendChild(panel);
  document.getElementById("pause-on-blur").onchange = (e) => {
    autoPauseOnBlur = e.target.checked;
    localStorage.setItem("pauseOnBlur", autoPauseOnBlur ? "true" : "false");
  };
}
// Start Sleep Timer
function startSleepTimer() {
  const mins = parseInt(document.getElementById("sleep-time").value || "15");
  sleepCountdown = mins * 60;
  if (sleepInterval) clearInterval(sleepInterval);
  sleepInterval = setInterval(() => {
    sleepCountdown--;
    updateSleepStatus();
    if (sleepCountdown <= 0) {
      clearInterval(sleepInterval);
      pausePlayback();
      updateSleepStatus("🔕 Sleep Timer Finished");
    }
  }, 1000);
  updateSleepStatus();
}
// Cancel Sleep Timer
function cancelSleepTimer() {
  clearInterval(sleepInterval);
  sleepCountdown = 0;
  updateSleepStatus("🛑 Sleep Timer Cancelled");
}
// Update Status Display
function updateSleepStatus(msg) {
  const box = document.getElementById("sleep-status");
  if (msg) {
    box.innerText = msg;
  } else {
    box.innerText = `⏳ Sleep in ${Math.floor(sleepCountdown / 60)}m ${sleepCountdown % 60}s`;
  }
}
// Auto Pause on Blur
window.addEventListener("blur", () => {
  if (autoPauseOnBlur) {
    pausePlayback();
    updateSleepStatus("🛑 Auto Paused on Blur");
  }
});
// Idle Timeout Trigger
function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    pausePlayback();
    updateSleepStatus("🛑 Paused due to Inactivity");
  }, idleTimeoutMs);
}
["click", "keydown", "mousemove", "scroll"].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer);
});


// ================================
// MODULE 42
// ================================

// ==========================
// Module 43 – Keyboard Shortcuts & Gesture Control
// ==========================
let shortcutsEnabled = true;
let gestureLog = [];
// ✅ Toggle UI
function createShortcutTogglePanel() {
  const panel = document.createElement("div");
  panel.style = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: #f1f1f1;
    padding: 8px;
    font-size: 13px;
    z-index: 9999;
    border: 1px solid #aaa;
    box-shadow: 0 0 4px #ccc;
  `;
  panel.innerHTML = `
    <label><input type="checkbox" id="shortcut-enable" checked /> Enable Keyboard & Gesture Control</label>
    <div id="key-log" style="margin-top: 6px; font-size: 12px; color: #555;"></div>
  `;
  document.body.appendChild(panel);
  document.getElementById("shortcut-enable").onchange = (e) => {
    shortcutsEnabled = e.target.checked;
    localStorage.setItem("shortcutsEnabled", shortcutsEnabled ? "true" : "false");
  };
}
// ✅ Keyboard Shortcuts
function handleKeyShortcuts(e) {
  if (!shortcutsEnabled) return;
  const key = e.key.toLowerCase();
  const log = [];
  if (e.ctrlKey || e.shiftKey || e.altKey) {
    log.push("Modifiers: ");
    if (e.ctrlKey) log.push("Ctrl ");
    if (e.shiftKey) log.push("Shift ");
    if (e.altKey) log.push("Alt ");
  }
  log.push(`Key: ${key}`);
  document.getElementById("key-log").innerText = log.join("");
  // Shortcut mapping
  if (e.ctrlKey && key === "p") {
    playWithPriority();
  } else if (key === "p") {
    togglePlayPause();
  } else if (key === "arrowleft") {
    previousSentence();
  } else if (key === "arrowright") {
    nextSentence();
  } else if (key === "+") {
    increaseSpeed();
  } else if (key === "-") {
    decreaseSpeed();
  } else if (key === "s") {
    saveToLibrary();
  } else if (e.shiftKey && key === "s") {
    saveToFavorites();
  } else if (key === "q") {
    addToQueue();
  }
}
// Example action bindings
function togglePlayPause() { console.log("🔁 Play/Pause triggered"); }
function previousSentence() { console.log("⬅️ Prev Sentence"); }
function nextSentence() { console.log("➡️ Next Sentence"); }
function increaseSpeed() { console.log("⏩ Speed +"); }
function decreaseSpeed() { console.log("⏪ Speed -"); }
function saveToLibrary() { console.log("💾 Saved to Library"); }
function saveToFavorites() { console.log("⭐ Saved to Favorites"); }
function addToQueue() { console.log("🧺 Added to Queue"); }
function playWithPriority() { console.log("🔥 Priority Playback"); }
// ✅ Gesture Handling
let touchStartX = 0;
let touchStartY = 0;
function handleTouchStart(e) {
  if (!shortcutsEnabled) return;
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}
function handleTouchEnd(e) {
  if (!shortcutsEnabled) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) {
      nextSentence();
      logGesture("Swipe →");
    } else if (dx < -30) {
      previousSentence();
      logGesture("Swipe ←");
    }
  } else {
    if (dy < -30) {
      increaseSpeed();
      logGesture("Swipe ↑");
    } else if (dy > 30) {
      decreaseSpeed();
      logGesture("Swipe ↓");
    }
  }
}
function logGesture(msg) {
  gestureLog.push(msg);
  if (gestureLog.length > 5) gestureLog.shift();
  document.getElementById("key-log").innerText = "Gestures: " + gestureLog.join(", ");
}


// ================================
// MODULE 43
// ================================

function detectSmartTitle(fileName, fileContent) {
  const titleTag = document.title.trim();
  const firstHeader = document.querySelector("h1, h2");
  const firstLine = fileContent.split("\n").find(line => line.trim().length > 5);
  let title = fileName.replace(/\.[^/.]+$/, ""); // default
  if (titleTag && titleTag.length > 3) title = titleTag;
  else if (firstHeader && firstHeader.textContent.length > 3) title = firstHeader.textContent.trim();
  else if (firstLine) title = firstLine.trim();
  return title;
}

// ======== Modules 45 to 51 ========



// ========== Module 45.docx ==========

// ==========================
// Module 45 – Voice Avatar Customization
// ==========================
const voiceAvatars = [
  { id: "avatar1", name: "Alex", voice: "en-US-GuyNeural", image: "👨‍💼" },
  { id: "avatar2", name: "Sophia", voice: "en-US-JennyNeural", image: "👩‍💼" },
  { id: "avatar3", name: "Liam", voice: "en-GB-RyanNeural", image: "🧑‍🎤" },
  { id: "avatar4", name: "Emma", voice: "en-GB-SoniaNeural", image: "🧑‍🏫" },
  { id: "avatar5", name: "Zane", voice: "en-US-DavisNeural", image: "🧑‍🚀" }
];
// Save avatar selection
function saveSelectedAvatar(id) {
  localStorage.setItem("selectedAvatarId", id);
}
// Get current selection
function getSelectedAvatarId() {
  return localStorage.getItem("selectedAvatarId") || "avatar1";
}
// Get full avatar object
function getSelectedAvatar() {
  const id = getSelectedAvatarId();
  return voiceAvatars.find((a) => a.id === id) || voiceAvatars[0];
}
// Apply avatar’s voice to utterance
function applyAvatarToTTS(utterance) {
  const avatar = getSelectedAvatar();
  utterance.voice = speechSynthesis
    .getVoices()
    .find((v) => v.name === avatar.voice);
  utterance.name = avatar.name;
}
// Export avatar choice
function exportAvatarChoice() {
  const avatar = getSelectedAvatar();
  return {
    id: avatar.id,
    name: avatar.name,
    voice: avatar.voice,
    image: avatar.image
  };
}
// Add avatar info to profile object
function appendAvatarToProfile(profile) {
  const avatar = exportAvatarChoice();
  return { ...profile, avatar };
}
// Render avatar picker UI
function renderAvatarPicker() {
  const container = document.createElement("div");
  container.id = "avatar-picker";
  container.style = "margin: 1em 0; padding: 1em; border: 1px dashed #ccc; display: flex; gap: 10px; justify-content: space-around; flex-wrap: wrap;";
  voiceAvatars.forEach((avatar) => {
    const btn = document.createElement("button");
    btn.textContent = `${avatar.image} ${avatar.name}`;
    btn.style = `
      padding: 10px;
      font-size: 16px;
      border-radius: 8px;
      border: 2px solid ${getSelectedAvatarId() === avatar.id ? "#007bff" : "#ccc"};
      background: ${getSelectedAvatarId() === avatar.id ? "#eef7ff" : "#f9f9f9"};
      cursor: pointer;
    `;
    btn.onclick = () => {
      saveSelectedAvatar(avatar.id);
      renderAvatarPicker(); // re-render to reflect active choice
    };
    container.appendChild(btn);
  });
  const existing = document.getElementById("avatar-picker");
  if (existing) existing.replaceWith(container);
  else document.body.appendChild(container);
}


// ========== Module 46.docx ==========

// ==========================
// Module 46 – Theme & UI Preferences
// ==========================
const themes = {
  light: {
    primary: "#ffffff",
    font: "#000000",
    hover: "yellow",
  },
  dark: {
    primary: "#121212",
    font: "#f0f0f0",
    hover: "#916B3D",
  },
  blue: {
    primary: "#001f3f",
    font: "#ffffff",
    hover: "#916B3D",
  },
  royal: {
    primary: "#2C2A4A",
    font: "#ffffff",
    hover: "#916B3D",
  },
  gray: {
    primary: "#333333",
    font: "#f0f0f0",
    hover: "#916B3D",
  },
};
function createThemeDropdown() {
  const container = document.createElement("div");
  container.id = "theme-picker";
  container.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.6);
    color: white;
    padding: 10px;
    border-radius: 6px;
    font-family: sans-serif;
    z-index: 9999;
  `;
  const label = document.createElement("label");
  label.innerText = "🎨 Theme: ";
  const select = document.createElement("select");
  select.id = "theme-select";
  Object.keys(themes).forEach((theme) => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme.charAt(0).toUpperCase() + theme.slice(1) + " Mode";
    select.appendChild(option);
  });
  select.onchange = (e) => {
    const selected = e.target.value;
    applyTheme(selected);
    saveThemePref(selected);
  };
  label.appendChild(select);
  container.appendChild(label);
  document.body.appendChild(container);
}
function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;
  document.body.className = "theme-" + themeName;
  document.body.style.backgroundColor = theme.primary;
  document.body.style.color = theme.font;
  document.documentElement.style.setProperty("--hover-color", theme.hover);
  document.documentElement.style.setProperty("--font-color", theme.font);
  document.documentElement.style.setProperty("--background-color", theme.primary);
  const links = document.querySelectorAll("a, button, .highlight");
  links.forEach((el) => {
    el.style.color = theme.font;
    el.onmouseover = () => (el.style.color = theme.hover);
    el.onmouseout = () => (el.style.color = theme.font);
  });
  console.log(`🎨 Applied ${themeName} theme.`);
}
function saveThemePref(themeName) {
  localStorage.setItem("userTheme", themeName);
}
function loadSavedTheme() {
  const saved = localStorage.getItem("userTheme") || "light";
  applyTheme(saved);
  const select = document.getElementById("theme-select");
  if (select) select.value = saved;
}
function getCurrentTheme() {
  return localStorage.getItem("userTheme") || "light";
}

// ========== Module 47.docx ==========

// ==========================
// Module 47 – Profile Preferences & Saved Settings
// ==========================
const defaultProfile = {
  name: "",
  language: "en",
  autoplay: false,
  voice: "",
  pitch: 1.0,
  rate: 1.0,
};
function loadProfilePrefs() {
  const stored = localStorage.getItem("profilePrefs");
  if (!stored) return { ...defaultProfile };
  try {
    return JSON.parse(stored);
  } catch {
    return { ...defaultProfile };
  }
}
function saveProfilePrefs(prefs) {
  localStorage.setItem("profilePrefs", JSON.stringify(prefs));
  logProfileMessage("✅ Preferences saved.");
}
function resetProfilePrefs() {
  localStorage.removeItem("profilePrefs");
  setProfileForm(defaultProfile);
  logProfileMessage("🔄 Preferences cleared.");
}
function setProfileForm(profile) {
  document.getElementById("prof-name").value = profile.name;
  document.getElementById("prof-lang").value = profile.language;
  document.getElementById("prof-auto").checked = profile.autoplay;
  document.getElementById("prof-voice").value = profile.voice || "";
  document.getElementById("prof-pitch").value = profile.pitch;
  document.getElementById("prof-rate").value = profile.rate;
  document.getElementById("val-pitch").innerText = profile.pitch;
  document.getElementById("val-rate").innerText = profile.rate;
}
function getProfileFormValues() {
  return {
    name: document.getElementById("prof-name").value.trim(),
    language: document.getElementById("prof-lang").value,
    autoplay: document.getElementById("prof-auto").checked,
    voice: document.getElementById("prof-voice").value,
    pitch: parseFloat(document.getElementById("prof-pitch").value),
    rate: parseFloat(document.getElementById("prof-rate").value),
  };
}
function logProfileMessage(msg) {
  const log = document.getElementById("profile-log");
  if (log) {
    log.innerText = msg;
    setTimeout(() => (log.innerText = ""), 3000);
  }
}
function initProfileUI() {
  const panel = document.createElement("div");
  panel.innerHTML = `
    <h3>👤 Profile Settings</h3>
    <label>Name: <input id="prof-name" type="text" /></label><br><br>
    <label>Language: 
      <select id="prof-lang">
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="pt">Portuguese</option>
      </select>
    </label><br><br>
    <label>Voice: 
      <select id="prof-voice">
        <option value="">(default)</option>
        <!-- Filled dynamically -->
      </select>
    </label><br><br>
    <label><input type="checkbox" id="prof-auto" /> Auto-play on load</label><br><br>
    <label>Pitch: 
      <input id="prof-pitch" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
      <span id="val-pitch">1.0</span>
    </label><br><br>
    <label>Rate: 
      <input id="prof-rate" type="range" min="0.5" max="2.0" step="0.1" value="1.0" />
      <span id="val-rate">1.0</span>
    </label><br><br>
    <button onclick="saveProfilePrefs(getProfileFormValues())">💾 Save</button>
    <button onclick="resetProfilePrefs()">🗑️ Clear</button>
    <div id="profile-log" style="margin-top:10px; font-size:13px;"></div>
  `;
  const profileTab = document.getElementById("profile");
  if (profileTab) profileTab.appendChild(panel);
  const pitchInput = document.getElementById("prof-pitch");
  pitchInput.oninput = () => {
    document.getElementById("val-pitch").innerText = pitchInput.value;
  };
  const rateInput = document.getElementById("prof-rate");
  rateInput.oninput = () => {
    document.getElementById("val-rate").innerText = rateInput.value;
  };
  const voiceSelect = document.getElementById("prof-voice");
  const voices = window.speechSynthesis.getVoices();
  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.text = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}

// ========== Module 48.docx ==========

// ==========================
// Module 48 – Auto Language Detection & Smart Translation
// ==========================
let smartTranslateEnabled = false;
function detectLanguage(text) {
  const commonWords = {
    en: ["the", "and", "is", "of", "to", "in", "that"],
    es: ["el", "la", "es", "de", "que", "en", "y"],
    fr: ["le", "la", "est", "de", "et", "en", "que"],
    pt: ["o", "a", "é", "de", "e", "em", "que"]
  };
  const scores = {};
  const words = text.toLowerCase().split(/\W+/);
  for (const [lang, keywords] of Object.entries(commonWords)) {
    scores[lang] = keywords.reduce(
      (acc, word) => acc + words.filter(w => w === word).length,
      0
    );
  }
  const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return detected[1] > 0 ? detected[0] : "en";
}
async function translateText(text, fromLang, toLang) {
  if (fromLang === toLang) return text;
  // TODO: Replace with actual API integration
  return `[${toLang.toUpperCase()}] ${text}`;
}
function loadProfilePrefs() {
  const lang = localStorage.getItem("preferredLanguage") || "en";
  return { preferredLanguage: lang };
}
async function prepareSentenceForTTS(sentence) {
  if (!smartTranslateEnabled) return sentence;
  const profilePrefs = loadProfilePrefs();
  const fromLang = detectLanguage(sentence);
  const toLang = profilePrefs.preferredLanguage;
  const translated = await translateText(sentence, fromLang, toLang);
  devLog(`🌐 Translated "${sentence}" (${fromLang} ➜ ${toLang})`);
  return translated;
}
function toggleSmartTranslate(section, enabled) {
  smartTranslateEnabled = enabled;
  localStorage.setItem("smartTranslateEnabled", enabled);
  devLog(`🌍 Smart Translate ${enabled ? "enabled" : "disabled"} in ${section}`);
}
// Initialize smart translate toggle
function initSmartTranslateUI(sectionId) {
  const container = document.querySelector(`#${sectionId} .controls`) || document.getElementById(sectionId);
  if (!container) return;
  const label = document.createElement("label");
  label.style.marginLeft = "8px";
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = localStorage.getItem("smartTranslateEnabled") === "true";
  smartTranslateEnabled = toggle.checked;
  toggle.addEventListener("change", () => toggleSmartTranslate(sectionId, toggle.checked));
  label.appendChild(toggle);
  label.appendChild(document.createTextNode(" Smart Translate"));
  container.appendChild(label);
}


// Override sentence reading
async function speakSentence(sentence, voice, rate, pitch) {
  const translatedSentence = await prepareSentenceForTTS(sentence);
  const utter = new SpeechSynthesisUtterance(translatedSentence);
  utter.voice = voice;
  utter.rate = rate;
  utter.pitch = pitch;
  speechSynthesis.speak(utter);
}
// Override sentence iterator (if needed)
async function playSentences(sentences, voice, rate, pitch) {
  for (let i = 0; i < sentences.length; i++) {
    if (!isPlaying) break;
    const sentence = sentences[i];
    const translated = await prepareSentenceForTTS(sentence);
    highlightSentence(i);
    await speakSentence(translated, voice, rate, pitch);
    await delay(100); // Wait a bit before next
  }
}
// Utility: Log
function devLog(msg) {
  if (!window.devLogs) window.devLogs = [];
  const time = new Date().toLocaleTimeString();
  window.devLogs.push(`[${time}] ${msg}`);
  const box = document.getElementById("dev-log-box");
  if (box) box.innerText = window.devLogs.slice(-10).join("\n");
}
// Utility: Delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== Module 49.docx ==========

// ==========================
// Module 49 – Smart Skipping of Low-Importance Sentences
// ==========================
let smartSkipEnabled = false;
let importanceThreshold = 0.5;
function scoreSentence(sentence) {
  if (!sentence) return 0;
  const keywords = ["important", "must", "note", "warning", "critical", "essential"];
  const lenScore = Math.min(sentence.length / 200, 1.0);
  const keywordScore = keywords.filter(word => sentence.toLowerCase().includes(word)).length * 0.2;
  const punctScore = /[:;!?]/.test(sentence) ? 0.2 : 0;
  const score = Math.min(1.0, lenScore + keywordScore + punctScore);
  return score;
}
function shouldPlaySentence(sentence) {
  const score = scoreSentence(sentence);
  devLog(`🎯 "${sentence}" scored ${score.toFixed(2)}`);
  return score >= importanceThreshold;
}
function toggleSmartSkip(enabled) {
  smartSkipEnabled = enabled;
  localStorage.setItem("smartSkipEnabled", enabled);
  devLog(`⏩ Smart Skip ${enabled ? "enabled" : "disabled"}`);
}
function setImportanceThreshold(value) {
  importanceThreshold = value;
  localStorage.setItem("importanceThreshold", value);
  devLog(`📊 Threshold set to ${value}`);
}
function initSmartSkipUI(sectionId) {
  const container = document.querySelector(`#${sectionId} .controls`) || document.getElementById(sectionId);
  if (!container) return;
  const toggleLabel = document.createElement("label");
  toggleLabel.style.marginLeft = "12px";
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = localStorage.getItem("smartSkipEnabled") === "true";
  smartSkipEnabled = toggle.checked;
  toggle.addEventListener("change", () => toggleSmartSkip(toggle.checked));
  toggleLabel.appendChild(toggle);
  toggleLabel.appendChild(document.createTextNode(" Smart Skip"));
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0.1";
  slider.max = "1.0";
  slider.step = "0.1";
  slider.value = localStorage.getItem("importanceThreshold") || "0.5";
  importanceThreshold = parseFloat(slider.value);
  slider.style.marginLeft = "10px";
  slider.title = "Importance Threshold";
  slider.addEventListener("input", () => setImportanceThreshold(parseFloat(slider.value)));
  container.appendChild(toggleLabel);
  container.appendChild(slider);
}

// Updated version of playSentences()
async function playSentences(sentences, voice, rate, pitch) {
  for (let i = 0; i < sentences.length; i++) {
    if (!isPlaying) break;
    const sentence = sentences[i];
    if (smartSkipEnabled && !shouldPlaySentence(sentence)) {
      devLog(`🚫 Skipped: "${sentence}"`);
      continue;
    }
    highlightSentence(i);
    await speakSentence(sentence, voice, rate, pitch);
    await delay(100);
  }
}
// Utility: Log
function devLog(msg) {
  if (!window.devLogs) window.devLogs = [];
  const time = new Date().toLocaleTimeString();
  window.devLogs.push(`[${time}] ${msg}`);
  const box = document.getElementById("dev-log-box");
  if (box) box.innerText = window.devLogs.slice(-10).join("\n");
}
// Utility: Delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ========== Module 50.docx ==========

// ==========================
// Module 50 – Real-Time Translation Overlay
// ==========================
let translationEnabled = false;
let translationLang = "es"; // Default Spanish
function initTranslationSettings(sectionId) {
  const container = document.querySelector(`#${sectionId} .controls`) || document.getElementById(sectionId);
  if (!container) return;
  const toggleLabel = document.createElement("label");
  toggleLabel.style.marginLeft = "10px";
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = localStorage.getItem("translationEnabled") === "true";
  translationEnabled = toggle.checked;
  toggle.addEventListener("change", () => {
    translationEnabled = toggle.checked;
    localStorage.setItem("translationEnabled", translationEnabled);
    devLog(`🌐 Translation ${translationEnabled ? "ON" : "OFF"}`);
  });
  toggleLabel.appendChild(toggle);
  toggleLabel.appendChild(document.createTextNode(" Show Translation"));
  const langSelect = document.createElement("select");
  const languages = {
    es: "Spanish",
    fr: "French",
    de: "German",
    pt: "Portuguese",
    zh: "Chinese",
    hi: "Hindi"
  };
  for (const [code, name] of Object.entries(languages)) {
    const option = document.createElement("option");
    option.value = code;
    option.text = name;
    langSelect.appendChild(option);
  }
  langSelect.value = localStorage.getItem("translationLang") || "es";
  translationLang = langSelect.value;
  langSelect.addEventListener("change", () => {
    translationLang = langSelect.value;
    localStorage.setItem("translationLang", translationLang);
    devLog(`🌐 Translation language set to ${languages[translationLang]}`);
  });
  langSelect.style.marginLeft = "10px";
  container.appendChild(toggleLabel);
  container.appendChild(langSelect);
}
// Fake/mock translator
async function translateSentence(text, lang) {
  return `[${lang.toUpperCase()}] ${text}`;
}
// Overlay rendering
function showTranslation(index, translated) {
  const existing = document.querySelector(`#sentence-${index} .translation-line`);
  if (existing) existing.remove();
  const el = document.querySelector(`#sentence-${index}`);
  if (el) {
    const transEl = document.createElement("div");
    transEl.className = "translation-line";
    transEl.textContent = translated;
    transEl.style.fontSize = "0.9em";
    transEl.style.fontStyle = "italic";
    transEl.style.color = "#777";
    transEl.style.marginTop = "4px";
    el.appendChild(transEl);
  }
}
// Updated playback
async function playSentences(sentences, voice, rate, pitch) {
  for (let i = 0; i < sentences.length; i++) {
    if (!isPlaying) break;
    const sentence = sentences[i];
    highlightSentence(i);
    if (translationEnabled) {
      const translated = await translateSentence(sentence, translationLang);
      showTranslation(i, translated);
    }
    await speakSentence(sentence, voice, rate, pitch);
    await delay(100);
  }
}


// ========== Module 50 b.docx ==========

// ==========================
// Module 50 – Context-Aware Summary Before Playback
// ==========================
function summarizeText(sentences, maxSentences = 4) {
  if (!sentences || !sentences.length) return "No content to summarize.";
  const scores = sentences.map((s, idx) => {
    const lengthScore = Math.min(s.length / 150, 1);
    const keywordScore = ["important", "note", "summary", "main", "core", "chapter", "purpose"]
      .filter(w => s.toLowerCase().includes(w)).length * 0.5;
    const punctuationScore = /[:;!?]/.test(s) ? 0.3 : 0;
    const positionScore = 1 - idx / sentences.length;
    return { s, score: lengthScore + keywordScore + punctuationScore + positionScore };
  });
  scores.sort((a, b) => b.score - a.score);
  const topSentences = scores.slice(0, maxSentences).map(item => item.s.trim());
  return topSentences.join(" ");
}
function displaySummary(section, summaryText) {
  const container = document.querySelector(`#${section} .summary-preview`);
  if (!container) return;
  container.innerText = summaryText;
}
function saveSummary(fileKey, summaryText) {
  if (!window.localStorage) return;
  localStorage.setItem(`summary_${fileKey}`, summaryText);
}
function getSavedSummary(fileKey) {
  return localStorage.getItem(`summary_${fileKey}`) || "";
}
function getCurrentFileKey() {
  const name = localStorage.getItem("lastFileName");
  return name || "unnamed";
}
function initSummaryFeature(section) {
  const target = document.getElementById(section);
  if (!target) return;
  const summaryBox = document.createElement("div");
  summaryBox.className = "summary-preview";
  summaryBox.style.border = "1px solid #ccc";
  summaryBox.style.padding = "10px";
  summaryBox.style.margin = "10px 0";
  summaryBox.style.background = "#f9f9f9";
  summaryBox.style.whiteSpace = "pre-wrap";
  summaryBox.innerText = getSavedSummary(getCurrentFileKey());
  target.insertBefore(summaryBox, target.firstChild);
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.alignItems = "center";
  row.style.gap = "10px";
  const summarizeBtn = document.createElement("button");
  summarizeBtn.innerText = "🧠 Summarize & Preview";
  summarizeBtn.onclick = () => {
    const text = sentences.join(" ");
    const sents = text.split(/(?<=[.!?])\s+/);
    const summary = summarizeText(sents);
    displaySummary(section, summary);
    saveSummary(getCurrentFileKey(), summary);
    if (document.getElementById(`autoStartAfterSummary_${section}`)?.checked) {
      startPlayback(section);
    }
  };
  const autoStartToggle = document.createElement("label");
  autoStartToggle.style.display = "flex";
  autoStartToggle.style.alignItems = "center";
  const chk = document.createElement("input");
  chk.type = "checkbox";
  chk.id = `autoStartAfterSummary_${section}`;
  chk.style.marginRight = "5px";
  chk.checked = localStorage.getItem("autoStartAfterSummary") === "true";
  chk.addEventListener("change", () => {
    localStorage.setItem("autoStartAfterSummary", chk.checked);
  });
  autoStartToggle.appendChild(chk);
  autoStartToggle.appendChild(document.createTextNode("Auto-Start After Summary"));
  row.appendChild(summarizeBtn);
  row.appendChild(autoStartToggle);
  target.insertBefore(row, summaryBox);
}
function startPlayback(section) {
  if (typeof playSentences !== "function") return;
  const voice = getSelectedVoice(section);
  const rate = getRate(section);
  const pitch = getPitch(section);
  playSentences(sentences, voice, rate, pitch);
}
function getSelectedVoice(section) {
  const sel = document.querySelector(`#${section} .voice-dropdown`);
  return sel?.value || null;
}
function getRate(section) {
  const slider = document.querySelector(`#${section} .rate-slider`);
  return slider ? parseFloat(slider.value) : 1.0;
}
function getPitch(section) {
  const slider = document.querySelector(`#${section} .pitch-slider`);
  return slider ? parseFloat(slider.value) : 1.0;
}

// ========== Module 51.docx ==========

// ==========================
// Module 51 – Auto Language Detection and Suggestion
// ==========================
let languageDetectorReady = false;
let languageData = {};
let detectedLanguage = null;
let autoVoiceApplied = false;
// Load available voices grouped by language
function mapVoicesByLanguage(voices) {
  const map = {};
  voices.forEach((voice) => {
    const lang = voice.lang || "unknown";
    if (!map[lang]) map[lang] = [];
    map[lang].push(voice);
  });
  return map;
}
// Simple language detector using common heuristics
function detectLanguageFromText(text) {
  // Use the 'franc-min' library if available (install via CDN for full version)
  if (typeof franc !== "undefined") {
    const langCode = franc(text);
    return langCode || "und";
  }
  // Fallback: very naive frequency approach
  const lowercase = text.toLowerCase();
  if (lowercase.includes("el") && lowercase.includes("una")) return "es";
  if (lowercase.includes("the") && lowercase.includes("and")) return "en";
  if (lowercase.includes("le") && lowercase.includes("est")) return "fr";
  return "unknown";
}
// Store metadata per file including detected language
async function storeFileLanguage(fileId, language) {
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");
  const file = await store.get(fileId);
  if (file) {
    file.detectedLanguage = language;
    store.put(file);
  }
}
// Load language metadata
async function loadFileLanguage(fileId) {
  const tx = db.transaction("files", "readonly");
  const store = tx.objectStore("files");
  const file = await store.get(fileId);
  return file?.detectedLanguage || null;
}
// Suggest appropriate voice
function suggestVoice(languageCode, target = "listen") {
  const voices = speechSynthesis.getVoices();
  const voiceMap = mapVoicesByLanguage(voices);
  const possible = Object.keys(voiceMap).filter((key) =>
    key.startsWith(languageCode)
  );
  if (possible.length > 0) {
    const suggested = voiceMap[possible[0]][0];
    const voiceSelect = document.querySelector(`#${target}-voice`);
    if (voiceSelect) {
      for (let i = 0; i < voiceSelect.options.length; i++) {
        if (
          voiceSelect.options[i].text.includes(suggested.name) ||
          voiceSelect.options[i].value.includes(suggested.name)
        ) {
          voiceSelect.selectedIndex = i;
          autoVoiceApplied = true;
          break;
        }
      }
    }
  }
}
// Main detection entry point
async function runLanguageDetection(text, fileId) {
  detectedLanguage = detectLanguageFromText(text);
  console.log("🌍 Detected Language:", detectedLanguage);
  await storeFileLanguage(fileId, detectedLanguage);
  suggestVoice(detectedLanguage);
}
// Hook during file load
async function afterFileLoad(textContent, fileId) {
  const existingLang = await loadFileLanguage(fileId);
  if (existingLang) {
    detectedLanguage = existingLang;
    console.log("🔁 Loaded stored language:", detectedLanguage);
    suggestVoice(detectedLanguage);
  } else {
    runLanguageDetection(textContent, fileId);
  }
}
// Manual override tracker
function trackLanguageOverride(prevLang, newLang) {
  if (prevLang !== newLang) {
    console.log(
      `📈 User override: from ${prevLang} to ${newLang}. Tracking for feedback.`
    );
  }
}
// Sample integration with voice dropdown
function onVoiceChange(target = "listen") {
  const voiceSelect = document.querySelector(`#${target}-voice`);
  const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
  const newLang = selectedOption.getAttribute("data-lang") || "unknown";
  if (autoVoiceApplied) {
    autoVoiceApplied = false;

  }
  trackLanguageOverride(detectedLanguage, newLang);
}
// Add listeners
function setupVoiceOverrideListener(target = "listen") {
  const select = document.querySelector(`#${target}-voice`);
  if (select) {
    select.addEventListener("change", () => onVoiceChange(target));
  }
}
// Call after file text has been extracted and displayed
// Example:
// await afterFileLoad(text, fileId);
// setupVoiceOverrideListener("listen");

// ========== Module 51 b.docx ==========

// ==============================
// Module 51 – Embedded Quizzes During Playback
// ==============================
let quizModeEnabled = localStorage.getItem("quizModeEnabled") === "true";
let quizCounter = 0;
let lastAskedQuestion = "";
function toggleQuizMode(enabled) {
  quizModeEnabled = enabled;
  localStorage.setItem("quizModeEnabled", enabled);
  devLog(`🧠 Quiz Mode ${enabled ? "enabled" : "disabled"}`);
}
function initQuizToggleUI(sectionId) {
  const container = document.querySelector(`#${sectionId} .controls`) || document.getElementById(sectionId);
  if (!container) return;
  const label = document.createElement("label");
  label.style.marginLeft = "10px";
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = quizModeEnabled;
  toggle.addEventListener("change", () => toggleQuizMode(toggle.checked));
  label.appendChild(toggle);
  label.appendChild(document.createTextNode(" Quiz Mode"));
  container.appendChild(label);
}

// ✅ Quiz question generator from sentence
function generateQuizQuestion(sentence) {
  const parts = sentence.split(" ");
  if (parts.length < 6) return null;
  const keyword = parts.find(word => word.length > 6 && !["because", "although"].includes(word.toLowerCase()));
  if (!keyword) return null;
  const question = `What is the significance of "${keyword}" in this context?`;
  const options = [
    "It is a key idea in the paragraph",
    "It is unrelated",
    "It is the author's name",
    "It refers to a location"
  ];
  const correctIndex = 0;
  return { question, options, correctIndex };
}
// ✅ Display quiz card
function showQuizCard({ question, options, correctIndex }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "quiz-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.6)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 9999;
    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.padding = "20px";
    card.style.borderRadius = "10px";
    card.style.width = "400px";
    card.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
    card.innerHTML = `<h3>🧠 Quick Check</h3><p>${question}</p>`;
    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.style.display = "block";
      btn.style.margin = "8px 0";
      btn.onclick = () => {
        const correct = i === correctIndex;
        alert(correct ? "✅ Correct!" : "❌ Incorrect.");
        overlay.remove();
        resolve();
      };
      card.appendChild(btn);
    });
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  });
}
// ✅ Enhanced playSentences with quiz logic
async function playSentences(sentences, voice, rate, pitch) {
  for (let i = 0; i < sentences.length; i++) {
    if (!isPlaying) break;
    const sentence = sentences[i];
    highlightSentence(i);
    await speakSentence(sentence, voice, rate, pitch);
    await delay(100);
    // 🔹 Show quiz every 5 sentences
    if (quizModeEnabled && i > 0 && i % 5 === 0) {
      const quiz = generateQuizQuestion(sentence);
      if (quiz && quiz.question !== lastAskedQuestion) {
        lastAskedQuestion = quiz.question;
        await showQuizCard(quiz);
      }
    }
  }
}
// 🔧 Utility
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}


// ========== Module 52: Real-Time Transcription ==========

// ==========================
// Module 52 – Real-Time Transcription with Confidence Scoring
// ==========================
let recognition;
let transcriptData = [];
let isListening = false;
const colors = {
  high: "#c8f7c5",
  mid: "#fff3b0",
  low: "#f9c0c0"
};
// UI Setup
const display = document.createElement("div");
display.id = "transcription-display";
display.style = "white-space: pre-wrap; padding: 10px; border: 1px solid #ccc; max-height: 200px; overflow-y: auto;";
document.body.appendChild(display);
const statsBox = document.createElement("div");
statsBox.id = "transcription-stats";
statsBox.style = "margin-top: 10px;";
document.body.appendChild(statsBox);
const buttons = document.createElement("div");
buttons.innerHTML = `
  <button onclick="startTranscription()">🎙️ Start</button>
  <button onclick="stopTranscription()">🛑 Stop</button>
  <button onclick="exportTranscript()">💾 Export</button>
  <button onclick="retryLowConfidence()">🔁 Retry</button>
`;
document.body.appendChild(buttons);
// Start Transcription
function startTranscription() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("SpeechRecognition not supported");

  }
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.onresult = (event) => {
    transcriptData = [];
    display.innerHTML = "";
    for (let i = 0; i < event.results.length; i++) {
      const res = event.results[i];
      const confidence = res[0].confidence;
      const words = res[0].transcript.trim().split(/\s+/);
      words.forEach((word) => {
        transcriptData.push({ word, confidence });
        const span = document.createElement("span");
        span.innerText = word + " ";
        span.style.backgroundColor = getConfidenceColor(confidence);
        display.appendChild(span);
      });
    }
    updateStats();
  };
  recognition.onerror = (e) => {
    console.error("Recognition error:", e);
  };
  recognition.onend = () => {
    isListening = false;
  };
  recognition.start();
  isListening = true;
}
// Stop Transcription
function stopTranscription() {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
}
// Determine Color by Confidence
function getConfidenceColor(c) {
  if (c >= 0.9) return colors.high;
  if (c >= 0.6) return colors.mid;
  return colors.low;
}
// Update Stats
function updateStats() {
  const total = transcriptData.length;
  const avg = transcriptData.reduce((sum, w) => sum + w.confidence, 0) / total;
  const low = transcriptData.filter(w => w.confidence < 0.6).length;
  statsBox.innerHTML = `
    <strong>📊 Stats:</strong><br>
    Total Words: ${total}<br>
    Avg Confidence: ${(avg * 100).toFixed(1)}%<br>
    Low Confidence Words: ${low}
  `;
}
// Export Transcript
function exportTranscript() {
  const data = {
    timestamp: new Date().toISOString(),
    transcript: transcriptData
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transcript_with_confidence.json";
  a.click();
  URL.revokeObjectURL(url);
}
// Retry Low Confidence Words
function retryLowConfidence() {
  const lowWords = transcriptData.filter(w => w.confidence < 0.6);
  if (lowWords.length === 0) {
    alert("No low-confidence words to retry.");

  }
  const textToRetry = lowWords.map(w => w.word).join(" ");
  const simulatedBox = document.createElement("div");
  simulatedBox.innerText = `🔁 Re-record: "${textToRetry}"`;
  simulatedBox.style = "margin-top: 10px; padding: 8px; background: #eef;";
  document.body.appendChild(simulatedBox);
}

// ========== Module 52b: Monospaced, TOC, Readability Enhancements ==========

// ==========================
// Module 52 – Monospaced Styling + Table of Contents + Readability Boost
// ==========================
// Apply monospaced styling to all document content blocks
function applyMonospaceStyle() {
  const contentBlocks = document.querySelectorAll(".text-display, .document-content, pre, code");
  contentBlocks.forEach(block => {
    block.style.fontFamily = "monospace";
    block.style.fontSize = "15px";
    block.style.lineHeight = "1.65";
    block.style.letterSpacing = "0.4px";
  });
}
// Create Table of Contents dynamically
function generateTableOfContents() {
  const content = document.querySelector(".document-content") || document.querySelector(".text-display");
  const headers = content.querySelectorAll("h1, h2, h3");
  const toc = document.createElement("div");
  toc.id = "toc-sidebar";
  toc.style = `
    position: fixed;
    top: 80px;
    left: 0;
    width: 260px;
    max-height: 80vh;
    overflow-y: auto;
    background: #f9f9f9;
    padding: 12px;
    border-right: 1px solid #ccc;
    font-family: monospace;
    font-size: 14px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.05);
    z-index: 999;
  `;
  let html = "<strong>📚 Table of Contents</strong><br><ul style='padding-left: 16px'>";
  headers.forEach((header, idx) => {
    const anchor = `toc-anchor-${idx}`;
    header.id = anchor;
    html += `<li><a href="#${anchor}" style="text-decoration:none;">${header.innerText}</a></li>`;
  });
  html += "</ul>";
  toc.innerHTML = html;
  document.body.appendChild(toc);
}
// Add readability toggle
function addReadabilityToggle() {
  const toggle = document.createElement("button");
  toggle.id = "readability-toggle";
  toggle.textContent = "🌓 Toggle Readability Mode";
  toggle.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: monospace;
    padding: 8px 14px;
    background: #222;
    color: #f0f0f0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toggle);
  let isRelaxed = true;
  toggle.onclick = () => {
    document.querySelectorAll(".text-display, .document-content").forEach(el => {
      el.style.lineHeight = isRelaxed ? "1.3" : "1.7";
      el.style.fontSize = isRelaxed ? "14px" : "16px";
    });
    isRelaxed = !isRelaxed;
  };
}
// Observe for content load or switch and apply all enhancements
const observer = new MutationObserver(() => {
  applyMonospaceStyle();
  if (!document.getElementById("toc-sidebar")) {
    generateTableOfContents();
  }
});
observer.observe(document.body, { childList: true, subtree: true });


// ===== Additional Enhancements (Modules 53 & 54) =====

// ========== Module 53: Shazam-like Speech & Music Recognition ==========
function recognizeAudioContent() {
  const simulatedResult = {
    type: "music",
    title: "Shape of You",
    artist: "Ed Sheeran",
    links: [
      "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3",
      "https://music.apple.com/us/album/shape-of-you/1193701079?i=1193701359",
      "https://www.youtube.com/watch?v=JGwWNGJdvx8"
    ]
  };
  const resultsBox = document.createElement("div");
  resultsBox.innerHTML = `
    <strong>🎵 Recognized:</strong><br>
    Title: ${simulatedResult.title}<br>
    Artist: ${simulatedResult.artist}<br>
    <ul>
      ${simulatedResult.links.map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join("")}
    </ul>
  `;
  resultsBox.style = "margin: 10px; padding: 10px; border: 1px dashed #444;";
  document.body.appendChild(resultsBox);
}

// ========== Module 54: Enhanced Speech-to-Text with Auto Playback ==========
let speechTimeout;
function enhancedTranscriptionPlayback(text, delay = 4000) {
  clearTimeout(speechTimeout);
  speechTimeout = setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  }, delay);
}

// Usage simulation for captured text
function simulateSpeechCapture() {
  const capturedText = "This is a captured sentence from live audio.";
  const displayBox = document.createElement("div");
  displayBox.innerText = `🎧 Captured: ${capturedText}`;
  displayBox.style = "margin-top: 10px; padding: 8px; background: #eef;";
  document.body.appendChild(displayBox);
  enhancedTranscriptionPlayback(capturedText);
}

// ===============================
// 🤖 Agentic Enhancements (Hotkey + Floating Panel + Avatar)
// ===============================

function createAgentPanel() {
  if (document.getElementById("agent-panel")) return;
  const panel = document.createElement("div");
  panel.id = "agent-panel";
  panel.innerHTML = `
    <div id="agent-header">
      <span>🎤 NeurAloud Agent</span>
      <button onclick="closeAgentPanel()">❌</button>
    </div>
    <div id="agent-content">
      <p>Hello! I’m your reading companion. Click a sentence or press ⌨️ Ctrl+Shift+A to begin.</p>
      <div class="avatar-container">
        <img src="agent-avatar.gif" alt="Avatar" class="animated-avatar"/>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
}

function toggleAgentPanel() {
  const existing = document.getElementById("agent-panel");
  if (existing) existing.remove();
  else createAgentPanel();
}

function closeAgentPanel() {
  const panel = document.getElementById("agent-panel");
  if (panel) panel.remove();
}

// Hotkey to toggle Agent Panel (Ctrl+Shift+A)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyA") {
    e.preventDefault();
    toggleAgentPanel();
  }
});

// ===============================
// 📦 Queue Playback Floating Panel
// ===============================
function createFloatingPlaybackPanel() {
  if (document.getElementById("floating-playback-panel")) return;
  const panel = document.createElement("div");
  panel.id = "floating-playback-panel";
  panel.innerHTML = `
    <div id="floating-header" class="draggable">
      <span>🎧 Now Playing</span>
      <button onclick="toggleFloatingPanel()">➖</button>
    </div>
    <div id="floating-body">
      <p id="current-sentence">No sentence loaded yet.</p>
      <div id="panel-controls">
        <button id="panel-play">▶️</button>
        <button id="panel-pause">⏸</button>
        <button id="panel-stop">⏹</button>
        <button id="panel-loop">🔁</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  makeDraggable(panel);
}

function toggleFloatingPanel() {
  const panel = document.getElementById("floating-playback-panel");
  if (panel) {
    panel.classList.toggle("collapsed");
  }
}

function makeDraggable(element) {
  const header = element.querySelector(".draggable");
  let offsetX = 0, offsetY = 0;
  header.onmousedown = function (e) {
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    document.onmousemove = function (e) {
      element.style.left = (e.clientX - offsetX) + "px";
      element.style.top = (e.clientY - offsetY) + "px";
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}


// ==============================
// ✅ Modular Initialization Functions - ALL
// ==============================

function initVoiceUISelections() {
  [
    "tts-engine-listen", "voice-listen",
    "tts-engine-capture", "voice-capture",
    "rate-slider", "pitch-slider",
    "loop-toggle", "auto-resume-toggle",
    "translation-lang"
  ].forEach(persistSelection);
}

function initTTSEngineSwitchListeners() {
  ["listen", "capture"].forEach(context => {
    const sel = document.getElementById(`tts-engine-${context}`);
    if (sel) {
      sel.addEventListener("change", () => {
        localStorage.setItem(`tts-engine-${context}`, sel.value);
        loadVoicesForEngine(sel.value, context);
      });
    }
  });
}

function initLocalVoices() {
  localVoices = speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    localVoices = speechSynthesis.getVoices();
    ["listen", "capture"].forEach(context => {
      const engine = document.getElementById(`tts-engine-${context}`).value;
      if (engine === "local") loadVoicesForEngine(engine, context);
    });
  };
}

async function initCloudVoices() {
  setupResponsiveVoice();

  await fetchGoogleVoices().then(() => {
    ["listen", "capture"].forEach(context => {
      if (document.getElementById(`tts-engine-${context}`).value === "google") {
        loadVoicesForEngine("google", context);
      }
    });
  });

  for (const context of ["listen", "capture"]) {
    const engine = document.getElementById(`tts-engine-${context}`)?.value?.toLowerCase();
    if (engine === "ibm") {
      await fetchIBMVoices(context);
    } else {
      loadVoicesForEngine(engine, context);
    }
  }
}

function initTranslationControls() {
  initTranslationSettings();
  const langSelector = document.getElementById("translation-language");
  if (langSelector) {
    langSelector.addEventListener("change", e => {
      setTranslationLanguage(e.target.value);
    });
  }
  const toggleBtn = document.getElementById("toggle-translation");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTranslation);
  }
}

function initDeveloperPanel() {
  const savedDev = localStorage.getItem("developerMode") === "true";
  const savedRole = localStorage.getItem("simulatedRole") || "free";
  const savedAB = localStorage.getItem("abGroup") || "A";

  if (checkDeveloperAccess() || savedDev) {
    developerMode = savedDev;
    simulatedUserRole = savedRole;
    createDevDashboard();

    document.getElementById("dev-toggle").checked = developerMode;
    document.getElementById("dev-user-role").value = simulatedUserRole;
    document.getElementById("ab-switcher").checked = savedAB === "B";
    devLog("Dashboard loaded");
  }
}

function initAudioPlayback() {
  const audioEl = document.getElementById("tts-audio");
  if (audioEl) {
    audioEl.addEventListener("play", () => {
      initAudioVisualizer("tts-audio");
    });
    audioEl.addEventListener("pause", stopWaveform);
    audioEl.addEventListener("ended", stopWaveform);
  }
}

function initDockedPanels() {
  createAgentPanel();
  createFloatingPlaybackPanel();
}

// ==============================
// 📦 Main Consolidated Load
// ==============================



window.addEventListener("DOMContentLoaded", async () => {
  // Load and populate local voices
  function populateLocalVoices() {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      ["listen", "capture"].forEach(context => {
        updateVoiceDropdown("local", voices, context);
      });
    }
  }

  // Add Local to TTS engine dropdowns
  ["listen", "capture"].forEach(context => {
    const engineSelect = document.getElementById(`tts-engine-${context}`);
    if (engineSelect && ![...engineSelect.options].some(opt => opt.value === "local")) {
      const option = document.createElement("option");
      option.value = "local";
      option.text = "Local";
      engineSelect.add(option, engineSelect.firstChild); // Add at the top
    }
  });

  // ResponsiveVoice SDK setup (no fetch)
  if (typeof responsiveVoice === "undefined") {
    const script = document.createElement("script");
    script.src = "https://code.responsivevoice.org/responsivevoice.js?key=4KSLPhgK";
    script.onload = () => console.log("✅ ResponsiveVoice SDK loaded");
    document.body.appendChild(script);
  }

  // Defer IBM voice loading if selected
  ["listen", "capture"].forEach(async (context) => {
    const engine = document.getElementById(`tts-engine-${context}`)?.value?.toLowerCase();
    if (engine === "ibm") {
      try {
        await fetchIBMVoices(context);
      } catch (err) {
        console.warn(`⚠️ IBM voice fetch failed for ${context}:`, err);
      }
    } else if (engine === "local") {
      populateLocalVoices();
    }
  });

  // Refresh local voices onvoiceschanged
  speechSynthesis.onvoiceschanged = populateLocalVoices;
});