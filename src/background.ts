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
      "track-mrv": true,
      "sort-method": SortMethod.MostRecentlyVisited,
      // theme: "dark", // Not used until dark mode override is implemented
    };
    chrome.storage.local.set(defaultValues, function () {
      console.log("Default values set.");
    });
  } else if (details.reason === "update") {
    // Extension is updated, do nothing for now but might use later
  }
});

// START OF Most Recent Update (MRV) order tracking for tabs (if enabled)
let mrvOrder: number[] = [];
let trackMrv = true;

// Check the initial settings
browser.storage.local
  .get(["track-mrv", "sort-method"])
  .then(({ "track-mrv": trackMrvSetting, "sort-method": sortMethod }) => {
    trackMrv = trackMrvSetting || false;
    if (trackMrv) {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        mrvOrder = tabs.map((tab) => tab.id || -1);
      });
    }
    // I think this is resetting mrvOrder every time the extension is loaded
    // if (sortMethod !== SortMethod.MostRecentlyVisited) {
    //   mrvOrder = [];
    // }
  });

// Update the settings when they change
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if ("track-mrv" in changes) {
      trackMrv = changes["track-mrv"].newValue || false;
    }

    // I think this will cause the mrvOrder to be reset every time the sort method is changed
    // if (
    //   "sort-method" in changes &&
    //   changes["sort-method"].newValue !== SortMethod.MostRecentlyVisited
    // ) {
    //   mrvOrder = [];
    // }
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  console.log("Before updating MRV order", mrvOrder, activeInfo.tabId);

  if (trackMrv) {
    const index = mrvOrder.indexOf(activeInfo.tabId);
    if (index > -1) {
      mrvOrder.splice(index, 1);
    }
    mrvOrder.unshift(activeInfo.tabId);
  }

  console.log("After updating MRV order", mrvOrder);
});

// Expose a function to get the MRV order
browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: number[]) => void) => {
    if (message.type === "getMrvOrder") {
      sendResponse(mrvOrder);
    }
  }
);
// END OF Most Recent Update (MRV) order tracking for tabs

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 */
browser.commands.onCommand.addListener((command) => {
  if (command === "previous_tab") {
    // If mrvOrder has length 1 it means the user has only visited 1 tab
    // Need at least 2 items in order to navigate to the previous tab
    if (mrvOrder.length > 1) {
      console.log("Navigating to previous tab (tab id: " + mrvOrder[0] + ")");
      browser.tabs.update(mrvOrder[1], { active: true });
    } else {
      console.log("No previous tabs to navigate to");
    }
  } else {
    console.log("Command not found: ", command);
  }
});
