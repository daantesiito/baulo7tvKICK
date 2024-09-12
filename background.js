chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        // Verifica que la URL de la pestaña esté en Kick
        if (activeTab.url && activeTab.url.includes('https://kick.com/')) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          });
        }
      }
    });
  });
  