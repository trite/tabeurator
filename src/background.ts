import browser from "webextension-polyfill";

import { SortMethod } from "./Shared/SortMethod";

/**
 * Fired when the user clicks on the browser action
 * or when they press the keyboard shortcut.
 */
browser.browserAction.onClicked.addListener((tab) => {
  console.log("Opening search box");
  browser.browserAction.setPopup({
    tabId: tab.id,
    // TODO: Rename to `search_box.html`
    popup: "searchWindow.html",
  });
  browser.browserAction.openPopup();
});

// Set storage defaults
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Extension is installed for the first time, set defaults
    let defaultValues = {
      "track-mru": true,
      "sort-method": SortMethod.MostRecentlyUpdated,
      // theme: "dark", // Not used until dark mode override is implemented
    };
    chrome.storage.local.set(defaultValues, function () {
      console.log("Default values set.");
    });
  } else if (details.reason === "update") {
    // Extension is updated, do nothing for now but might use later
  }
});

// START OF Most Recent Update (MRU) order tracking for tabs (if enabled)
let mruOrder: number[] = [];
let trackMru = true;

// Check the initial settings
browser.storage.local
  .get(["track-mru", "sort-method"])
  .then(({ "track-mru": trackMruSetting, "sort-method": sortMethod }) => {
    trackMru = trackMruSetting || false;
    if (trackMru) {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        mruOrder = tabs.map((tab) => tab.id || -1);
      });
    }
    // I think this is resetting mruOrder every time the extension is loaded
    // if (sortMethod !== SortMethod.MostRecentlyUpdated) {
    //   mruOrder = [];
    // }
  });

// Update the settings when they change
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if ("track-mru" in changes) {
      trackMru = changes["track-mru"].newValue || false;
    }

    // I think this will cause the mruOrder to be reset every time the sort method is changed
    // if (
    //   "sort-method" in changes &&
    //   changes["sort-method"].newValue !== SortMethod.MostRecentlyUpdated
    // ) {
    //   mruOrder = [];
    // }
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log("Before updating MRU order", mruOrder, activeInfo.tabId);

  if (trackMru) {
    const index = mruOrder.indexOf(activeInfo.tabId);
    if (index > -1) {
      mruOrder.splice(index, 1);
    }
    mruOrder.unshift(activeInfo.tabId);
  }

  console.log("After updating MRU order", mruOrder);
});

// Expose a function to get the MRU order
browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: number[]) => void) => {
    if (message.type === "getMruOrder") {
      sendResponse(mruOrder);
    }
  }
);
// END OF Most Recent Update (MRU) order tracking for tabs
