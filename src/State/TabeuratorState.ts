import browser from "webextension-polyfill";

// Mapped from values that overlap all 3:
//  - chrome.tabs.Tab - https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab
//  - browser.tabs.Tab - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab
//  - relevant to the info Tabeurator is trying to display to the user
export type Tab = {
  active: boolean;
  discarded: boolean | undefined;
  favIconUrl: string | undefined;
  // All the docs say for "highlighted" is "Whether the tab is highlighted."
  // Going to leave highlighted on for now and see if I can figure out what it means
  highlighted: boolean;
  id: number | undefined;
  incognito: boolean;
  index: number;
  // Can use this to build out MRV from before the extension started
  lastAccessed?: number | undefined;
  // Might be nice to do a hierarchy of tabs if this works
  // But the docs say:
  //  >> The ID of the tab that opened this tab, if any.
  //  >> This property is only present if the opener tab still exists.
  // That last part means we'd need to manually track the state on this, so maybe later
  openerTabId: number | undefined;
  pendingUrl: string | undefined;
  pinned: boolean;
  sessionId: string | undefined;
  status: string | undefined;
  title: string | undefined;
  url: string | undefined;
  windowId: number | undefined;
};

export const tabFromChromeTab = (tab: chrome.tabs.Tab): Tab => ({
  active: tab.active,
  discarded: tab.discarded,
  favIconUrl: tab.favIconUrl,
  highlighted: tab.highlighted,
  id: tab.id,
  incognito: tab.incognito,
  index: tab.index,
  lastAccessed: tab.lastAccessed,
  openerTabId: tab.openerTabId,
  pendingUrl: tab.pendingUrl,
  pinned: tab.pinned,
  sessionId: tab.sessionId,
  status: tab.status,
  title: tab.title,
  url: tab.url,
  windowId: tab.windowId,
});

export const tabFromFirefoxTab = (tab: browser.Tabs.Tab): Tab => ({
  active: tab.active,
  discarded: tab.discarded,
  favIconUrl: tab.favIconUrl,
  highlighted: tab.highlighted,
  id: tab.id,
  incognito: tab.incognito,
  index: tab.index,
  lastAccessed: tab.lastAccessed,
  openerTabId: tab.openerTabId,
  pendingUrl: tab.pendingUrl,
  pinned: tab.pinned,
  sessionId: tab.sessionId,
  status: tab.status,
  title: tab.title,
  url: tab.url,
  windowId: tab.windowId,
});

export type Window = {
  focused: boolean;
  id: number | undefined;
  // I guess if you allow the extension in incognito mode you might want
  // the option to know which window that is in the UI, or maybe the option
  // to hide the tabs that are in it
  incognito: boolean;
  // Not sure if this will be useful in the app, but might be good for debugging
  type: "normal" | "popup" | "panel" | "app" | "devtools" | undefined;
};

export const windowFromChromeWindow = (
  window: chrome.windows.Window
): Window => ({
  focused: window.focused,
  id: window.id,
  incognito: window.incognito,
  type: window.type,
});

export const windowFromFirefoxWindow = (
  window: browser.Windows.Window
): Window => ({
  focused: window.focused,
  id: window.id,
  incognito: window.incognito,
  type: window.type,
});

export type TabeuratorState = {
  tabs: Tab[];
  windows: Window[];
  mostRecentlyViewed: number[];
};
