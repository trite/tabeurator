const commandName = '_execute_browser_action';

/**
 * Update the UI: set the value of the shortcut textbox.
 */
async function updateUI() {
  let commands = await browser.commands.getAll();
  for (let command of commands) {
    if (command.name === commandName) {
      document.querySelector('#shortcut').value = command.shortcut;
    }
  }
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
  await browser.commands.update({
    name: commandName,
    shortcut: document.querySelector('#shortcut').value
  });
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
  await browser.commands.reset(commandName);
  updateUI();
}

// TODO-Theme-Override: Implement again as theme override
// /**
//  * Update the theme in storage when the theme toggle is changed.
//  */
// function updateTheme() {
//   let theme = this.checked ? 'dark' : 'light';
//   browser.storage.local.set({ theme: theme });
// }

/**
 * TODO: cleanup here
 * Update the UI when the page loads. - moved to DOMContentLoaded event listener below
 */
// document.addEventListener('DOMContentLoaded', updateUI);

/**
 * Handle update and reset button clicks
 */
document.querySelector('#update').addEventListener('click', updateShortcut)
document.querySelector('#reset').addEventListener('click', resetShortcut)


// TODO-Theme-Override: Implement again as theme override
// /**
//  * Update the theme based on the toggle switch.
//  */
// document.querySelector('#themeToggle').addEventListener('change', updateTheme);

document.addEventListener('DOMContentLoaded', () => {
  // Load the current settings
  browser.storage.local.get(['track-mru', 'sort-method'])
    .then(({ 'track-mru': trackMru, 'sort-method': sortMethod }) => {
      document.getElementById('track-mru').checked = trackMru || false;
      document.getElementById('sort-method').value = sortMethod || 'Alphabetical';
      updateMruOption(trackMru);
    });

  // Save the settings when they change
  document.getElementById('track-mru').addEventListener('change', (event) => {
    const trackMru = event.target.checked;
    browser.storage.local.set({ 'track-mru': trackMru });
    updateMruOption(trackMru);
    if (!trackMru && document.getElementById('sort-method').value === 'MRU') {
      browser.storage.local.set({ 'sort-method': 'Alphabetical' });
      document.getElementById('sort-method').value = 'Alphabetical';
    }
  });

  document.getElementById('sort-method').addEventListener('change', (event) => {
    browser.storage.local.set({ 'sort-method': event.target.value });
  });

  updateUI();
});

function updateMruOption(trackMru) {
  const mruOption = document.querySelector('#sort-method option[value="MRU"]');
  mruOption.disabled = !trackMru;
  mruOption.textContent = trackMru ? 'Most Recently Used' : 'Most Recently Used - Cannot use unless MRU data is tracked';
}