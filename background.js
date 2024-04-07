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
let gettingAllCommands = browser.commands.getAll();
gettingAllCommands.then((commands) => {
  console.log("commands:");
  for (let command of commands) {
    // Note that this logs to the Add-on Debugger's console: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Debugging
    // not the regular Web console.
    console.log("  " + command.name);
  }
  console.log("end of commands");
});

/**
 * Fired when a registered command is activated using a keyboard shortcut.
 *
 * In this sample extension, there is only one registered command: "Ctrl+Shift+U".
 * On Mac, this command will automatically be converted to "Command+Shift+U".
 */
browser.commands.onCommand.addListener((command) => {
  if (command === "toggle-feature") {
    console.log("Ctrl+Shift+U was pressed");
    browser.tabs.create({ url: "https://developer.mozilla.org" });
  } else if (command === "tab-search") {
    console.log("Tab search shortcut was pressed");
  } else {
    console.log("Command not found: ", command);
  }
});
