// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_HTML") {
    
    // ✅ return true FIRST to keep port open for async response
    (async () => {
      try {
        const html = document.documentElement.outerHTML;
        const url = window.location.href;
        const title = document.title;

        sendResponse({ html, url, title });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();

    return true; // ← THIS IS THE CRITICAL LINE
  }
});