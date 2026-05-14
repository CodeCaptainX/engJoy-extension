function formatTime(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
}

chrome.storage.local.get(["lastCapture"], (result) => {
  const status = document.getElementById("status");
  const time = document.getElementById("time");
  const last = result.lastCapture;

  if (!last) {
    status.textContent = "No capture yet.";
    time.textContent = "";
    return;
  }

  status.textContent = last.text;
  time.textContent = `Last captured: ${formatTime(last.time)}`;
});
