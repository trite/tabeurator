// Only needed for the firefox check, remove once refactored out
import browser from "webextension-polyfill";

export enum BrowserType {
  Chrome = "Chrome",
  Firefox = "Firefox",
  Unknown = "Unknown",
}

export function getBrowserType(): BrowserType {
  if (typeof chrome !== "undefined" && chrome.action) {
    return BrowserType.Chrome;
  } else if (typeof browser !== "undefined" && browser.browserAction) {
    return BrowserType.Firefox;
  } else {
    return BrowserType.Unknown;
  }
}

export const switchToTab = (newTabId: number) => {
  switch (getBrowserType()) {
    case BrowserType.Chrome:
      chrome.tabs.get(newTabId, (tab) => {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(newTabId, { active: true });
        });
      });
      break;

    case BrowserType.Firefox:
      chrome.tabs.get(newTabId, (tab) => {
        chrome.windows.update(tab.windowId, { focused: true }, () => {
          chrome.tabs.update(newTabId, { active: true }, () => window.close());
        });
      });
      break;

    case BrowserType.Unknown:
    default:
      console.error("No suitable action API found for `switchToTab` function!");
      break;
  }
};
