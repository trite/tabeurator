import browser from "webextension-polyfill";

/**
 * Returns all of the registered extension commands for this extension
 * and their shortcut (if active).
 *
 * Since there is only one registered command in this sample extension,
 * the returned `commandsArray` will look like the following:
 *    [{
 *       name: "toggle-feature",
 *       description: "Send a 'toggle-feature' event to the extension"
 *       shortcut: "Ctrl+Shift+U"
 *    }]
 */
let allCommands = browser.commands.getAll();
allCommands.then((commands) => {
  console.log("commands:");
  for (let command of commands) {
    // Note that this logs to the Add-on Debugger's console:
    //   https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Debugging
    // not the regular Web console.
    console.log("  " + command.name);
  }
  console.log("end of commands");
});

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
      "sort-method": "MostRecentlyUpdated",
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
let trackMru = false;

// Check the initial settings
browser.storage.local
  .get(["track-mru", "sort-method"])
  .then(({ "track-mru": trackMruSetting, "sort-method": sortMethod }) => {
    trackMru = trackMruSetting || false;
    if (sortMethod !== "MostRecentlyUpdated") {
      mruOrder = [];
    }
  });

// Update the settings when they change
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if ("track-mru" in changes) {
      trackMru = changes["track-mru"].newValue || false;
    }

    if (
      "sort-method" in changes &&
      changes["sort-method"].newValue !== "MostRecentlyUpdated"
    ) {
      mruOrder = [];
    }
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  if (trackMru) {
    const index = mruOrder.indexOf(activeInfo.tabId);
    if (index > -1) {
      mruOrder.splice(index, 1);
    }
    mruOrder.unshift(activeInfo.tabId);
  }
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
