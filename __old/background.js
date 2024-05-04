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
  logDebug("commands:");
  for (let command of commands) {
    // Note that this logs to the Add-on Debugger's console:
    //   https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Debugging
    // not the regular Web console.
    logDebug("  " + command.name);
  }
  logDebug("end of commands");
});

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 *
 * In this sample extension, there is only one registered command: "Ctrl+Shift+U".
 * On Mac, this command will automatically be converted to "Command+Shift+U".
 */
browser.commands.onCommand.addListener((command) => {
  if (command === "foo-bar") {
    logDebug("Ctrl+Shift+Y was pressed");
    browser.tabs.create({ url: "https://developer.mozilla.org" });
  }
  // else if (command === "tab-search") {
  //   browser.windows.create({
  //     url: browser.runtime.getURL("search_box.html"),
  //     type: "popup",
  //     height: 200,
  //     width: 400
  //   });
  // } 
  else {
    logDebug("Command not found: ", command);
  }
});

/**
 * Fired when the user clicks on the browser action
 * or when they press the keyboard shortcut.
 */
browser.browserAction.onClicked.addListener((tab) => {
  logDebug("Opening search box");
  browser.browserAction.setPopup({
    tabId: tab.id,
    popup: 'search_box.html'
  });
  browser.browserAction.openPopup();
});


// Set storage defaults
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Extension is installed for the first time
    let defaultValues = { theme: 'dark' };
    chrome.storage.local.set(defaultValues, function () {
      logDebug('Default values set.');
    });
  } else if (details.reason === 'update') {
    // Extension is updated
  }
});