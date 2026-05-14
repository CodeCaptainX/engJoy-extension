console.log("🚀 SentenceMiner loaded on:", window.location.href);

let lastSelection = "";

// Toast notification styles
function showToast(message, type = "loading") {
  // Remove existing toast
  const existing = document.getElementById("sm-toast");
  if (existing) existing.remove();

  const colors = {
    loading: { bg: "#1e1e2e", border: "#7F77DD", text: "white" },
    success: { bg: "#0F6E56", border: "#1D9E75", text: "white" },
    error: { bg: "#A32D2D", border: "#E24B4A", text: "white" }
  };

  const c = colors[type];
  const toast = document.createElement("div");
  toast.id = "sm-toast";
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: ${c.bg};
    color: ${c.text};
    border: 1.5px solid ${c.border};
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    z-index: 999999;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transition: opacity 0.3s;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);

  // Auto remove after 3s for success/error
  if (type !== "loading") {
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  return toast;
}

function getSelectionText() {
  const selection = window.getSelection();
  if (!selection) return "";
  return selection.toString().trim();
}

function maybeSendSelection() {
  const text = getSelectionText();

  if (!text) return;
  if (text === lastSelection) return;
  lastSelection = text;

  console.log("📨 Sending to background:", text);
  showToast("⏳ Saving...", "loading");

  chrome.runtime.sendMessage({ action: "capture_sentence", text }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("❌ Error:", chrome.runtime.lastError.message);
      showToast("❌ Extension error", "error");
      return;
    }
    if (!response?.ok) {
      console.error("❌ Failed:", response?.error);
      showToast("❌ Failed: " + response?.error, "error");
      return;
    }
    console.log("✅ Saved!", response.data);
    showToast("✅ Sentence saved!", "success");
  });
}

// Ctrl+Shift+S
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") {
    console.log("⌨️ Ctrl+Shift+S triggered");
    maybeSendSelection();
  }
});