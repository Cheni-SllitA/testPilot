export async function downloadPageHTML() {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused({ populate: true }, (window) => {
      const tab = window.tabs?.find(t => t.active);

      if (!tab?.id) {
        return reject(new Error("No active tab found"));
      }

      console.log("[TestPilot] Targeting tab:", tab.url, "id:", tab.id);

      chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_HTML" }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(new Error(chrome.runtime.lastError.message));
        }
        resolve(response);
      });
    });
  });
}