import browser from "webextension-polyfill";

import { SortMethod } from "./Shared/SortMethod";
import * as Logger from "./Shared/Logger";
import { BrowserType, getBrowserType, switchToTab } from "./Shared/Chrome";
import * as Events from "./State/StateEvents";
import * as StateManager from "./State/StateManager";

// Browser-specific initializations
switch (getBrowserType()) {
  case BrowserType.Chrome:
    // Display the popup when the action toolbar icon is clicked
    chrome.action.onClicked.addListener((tab) => {
      chrome.action.setPopup({
        tabId: tab.id,
        popup: "searchWindow.html",
      });
    });

    // Allows users to open the side panel by clicking on the action toolbar icon
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));

    break;

  case BrowserType.Firefox:
    // Display the popup when the action toolbar icon is clicked
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

// BEGIN Most Recent Version (MRV) order tracking for tabs (if enabled)
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

const updateMrvOrder = (activeInfo: chrome.tabs.TabActiveInfo) => {
  if (trackMrv) {
    const index = mrvOrder.indexOf(activeInfo.tabId);
    if (index > -1) {
      mrvOrder.splice(index, 1);
    }
    mrvOrder.unshift(activeInfo.tabId);
  }
};

// TODO: remove this probably, might need to rework MRV logic as well
// Update MRV order when a tab is activated
// browser.tabs.onActivated.addListener((activeInfo) => {
//   Logger.logDebug("Before updating MRV order", mrvOrder, activeInfo.tabId);

//   if (trackMrv) {
//     const index = mrvOrder.indexOf(activeInfo.tabId);
//     if (index > -1) {
//       mrvOrder.splice(index, 1);
//     }
//     mrvOrder.unshift(activeInfo.tabId);
//   }

//   Logger.logDebug("After updating MRV order", mrvOrder);
// });

// Expose a function to get the MRV order
browser.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: number[]) => void) => {
    if (message.type === "getMrvOrder") {
      sendResponse(mrvOrder);
    }
  }
);
// END Most Recent Version (MRV) order tracking for tabs

// BEGIN Event listeners for tab/window state changes,
//   state update events will be emitted to the sidebar/popup
//   so they can update UI accordingly

// TODO: remove below when done with it
// const notifyStateUpdate = async (event: Events.StateUpdateEvent) => {
//   console.log("Notifying state update:", event);
//   await chrome.runtime.sendMessage({
//     stateUpdateEvent: StateEvents.stateUpdateEvent(event.newState),
//   });
// };

chrome.windows.onCreated.addListener(async (window) => {
  await StateManager.Handlers.windowCreated(window);
  Logger.logDebug("Window created event emitted:", window);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  await StateManager.Handlers.windowFocusChanged(windowId);
  Logger.logDebug("Window focus changed event emitted:", windowId);
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  await StateManager.Handlers.windowRemoved(windowId);
  Logger.logDebug("Window removed event emitted:", windowId);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await StateManager.Handlers.tabActivated(activeInfo);
  Logger.logDebug("Tab activated event emitted:", activeInfo);

  // TODO: Maybe remove if this ends up being refactored out as part of state stuff?
  // Update MRV order
  updateMrvOrder(activeInfo);
});

chrome.tabs.onCreated.addListener(async (tab) => {
  await StateManager.Handlers.tabCreated(tab);
  Logger.logDebug("Tab created event emitted:", tab);
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  await StateManager.Handlers.tabRemoved(tabId, removeInfo);
  Logger.logDebug("Tab removed event emitted:", tabId, removeInfo);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await StateManager.Handlers.tabUpdated(tabId, changeInfo, tab);
  Logger.logDebug("Tab updated event emitted:", tab, changeInfo);
});
// END Event listeners for tab/window state changes

const enableSidebar = async () => {
  console.log("Enabling sidebar");

  switch (getBrowserType()) {
    case BrowserType.Chrome:
      await chrome.sidePanel.setOptions({
        path: "sidebar.html",
        enabled: true,
      });
      break;

    case BrowserType.Firefox:
      await browser.sidebarAction.open();
      break;

    case BrowserType.Unknown:
    default:
      console.error(
        "No suitable action API found for `enableSidebar` function!"
      );
      break;
  }
};

const disableSidebar = async () => {
  console.log("Disabling sidebar");

  switch (getBrowserType()) {
    case BrowserType.Chrome:
      await chrome.sidePanel.setOptions({
        enabled: false,
      });
      break;

    case BrowserType.Firefox:
      await browser.sidebarAction.close();
      break;

    case BrowserType.Unknown:
    default:
      console.error(
        "No suitable action API found for `disableSidebar` function!"
      );
      break;
  }
};

// TODO: Probably want to use the actual sidebar state in the long term
let isSidebarOpen = false;

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 */
browser.commands.onCommand.addListener(async (command) => {
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
      await disableSidebar();
    } else {
      await enableSidebar();
    }
    isSidebarOpen = !isSidebarOpen;
  } else {
    Logger.logDebug("Command not found: ", command);
  }
});
