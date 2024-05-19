import browser from "webextension-polyfill";

import { SortMethod } from "./Shared/SortMethod";
import * as Logger from "./Shared/Logger";
import { BrowserType, getBrowserType, switchToTab } from "./Shared/Chrome";

/**
 * Fired when the user clicks on the browser action
 * or when they press the keyboard shortcut.
 */
switch (getBrowserType()) {
  case BrowserType.Chrome:
    chrome.action.onClicked.addListener((tab) => {
      chrome.action.setPopup({
        tabId: tab.id,
        popup: "searchWindow.html",
      });
    });
    break;
  case BrowserType.Firefox:
    browser.browserAction.onClicked.addListener((tab) => {
      browser.browserAction.setPopup({
        tabId: tab.id,
        popup: "searchWindow.html",
      });
    });
    break;
  case BrowserType.Unknown:
  default:
    console.error("No suitable action API found for `onClicked` event!");
    break;
}

// Set storage defaults
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Extension is installed for the first time, set defaults
    let defaultValues = {
      "track-mrv": true,
      "sort-method": SortMethod.MostRecentlyVisited,
      // theme: "dark", // Not used until theme override is implemented
    };
    chrome.storage.local.set(defaultValues, function () {
      Logger.logDebug("Default values set.");
    });
  } else if (details.reason === "update") {
    // Extension is updated, do nothing for now but might use later
  }
});

// START OF Most Recent Version (MRV) order tracking for tabs (if enabled)
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
  });

// Update the settings when they change
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if ("track-mrv" in changes) {
      trackMrv = changes["track-mrv"].newValue || false;
    }
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  Logger.logDebug("Before updating MRV order", mrvOrder, activeInfo.tabId);

  if (trackMrv) {
    const index = mrvOrder.indexOf(activeInfo.tabId);
    if (index > -1) {
      mrvOrder.splice(index, 1);
    }
    mrvOrder.unshift(activeInfo.tabId);
  }

  Logger.logDebug("After updating MRV order", mrvOrder);
});

// Expose a function to get the MRV order
browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: number[]) => void) => {
    if (message.type === "getMrvOrder") {
      sendResponse(mrvOrder);
    }
  }
);
// END OF Most Recent Version (MRV) order tracking for tabs

// TODO: Probably want to use the actual sidebar state in the long term
let isSidebarOpen = false;

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 */
browser.commands.onCommand.addListener((command) => {
  if (command === "previous_tab") {
    // If mrvOrder has length 1 it means the user has only visited 1 tab
    // Need at least 2 items in order to navigate to the previous tab
    if (mrvOrder.length > 1) {
      Logger.logDebug(
        "Navigating to previous tab (tab id: " + mrvOrder[0] + ")"
      );
      switchToTab(mrvOrder[1]);
    } else {
      Logger.logDebug("No previous tabs to navigate to");
    }
  } else if (command === "toggle_sidebar") {
    if (isSidebarOpen) {
      browser.sidebarAction.close();
    } else {
      browser.sidebarAction.open();
    }
    isSidebarOpen = !isSidebarOpen;
  } else {
    Logger.logDebug("Command not found: ", command);
  }
});
