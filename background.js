const DEFAULT_API_BASE = "http://localhost:8080";

// Create right click menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-sentence",
    title: "⚡ Save to SentenceMiner",
    contexts: ["selection"]
  });
});

// Handle right click
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "save-sentence") {
    const text = info.selectionText?.trim();
    if (!text) return;
    handleSave(text);
  }
});

// Handle message from content.js (Ctrl+Shift+S)
// Handle message from content.js (Ctrl+Shift+S)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Message received:", message);

  if (message?.action === "capture_sentence") {
    const text = message.text?.trim();
    if (!text) {
      sendResponse({ ok: false, error: "Empty selection" });
      return true;
    }

    // Must call sendResponse inside .then/.catch
    handleSave(text)
      .then((data) => {
        sendResponse({ ok: true, data });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message });
      });

    return true; // CRITICAL - keeps channel open for async
  }

  return true;
});
async function handleSave(text) {
  console.log("📤 Saving:", text);
  try {
    const data = await postSentence(text);
    chrome.storage.local.set({
      lastCapture: { text, time: Date.now(), status: "ok" }
    });
    console.log("✅ Saved!", data);
    return data;
  } catch (err) {
    chrome.storage.local.set({
      lastCapture: { text, time: Date.now(), status: "error", error: err.message }
    });
    console.error("❌ Failed:", err.message);
    throw err;
  }
}

async function postSentence(text, source = "extension") {
  const response = await fetch(`${DEFAULT_API_BASE}/api/sentences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${response.status} ${errorText}`);
  }

  return response.json();
}