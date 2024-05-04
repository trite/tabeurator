export const switchToTab = (newTabId: number) =>
  chrome.tabs.get(newTabId, (tab) => {
    chrome.windows.update(tab.windowId, { focused: true }, () => {
      chrome.tabs.update(newTabId, { active: true }, () => window.close());
    });
  });
