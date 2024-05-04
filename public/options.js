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
  browser.storage.local.get(['track-mrv', 'sort-method'])
    .then(({ 'track-mrv': trackMrv, 'sort-method': sortMethod }) => {
      document.getElementById('track-mrv').checked = trackMrv || false;
      document.getElementById('sort-method').value = sortMethod || 'Alphabetical';
      updateMrvOption(trackMrv);
    });

  // Save the settings when they change
  document.getElementById('track-mrv').addEventListener('change', (event) => {
    const trackMrv = event.target.checked;
    browser.storage.local.set({ 'track-mrv': trackMrv });
    updateMrvOption(trackMrv);
    if (!trackMrv && document.getElementById('sort-method').value === 'MRV') {
      browser.storage.local.set({ 'sort-method': 'Alphabetical' });
      document.getElementById('sort-method').value = 'Alphabetical';
    }
  });

  document.getElementById('sort-method').addEventListener('change', (event) => {
    browser.storage.local.set({ 'sort-method': event.target.value });
  });

  updateUI();
});

function updateMrvOption(trackMrv) {
  const mrvOption = document.querySelector('#sort-method option[value="MRV"]');
  mrvOption.disabled = !trackMrv;
  mrvOption.textContent = trackMrv ? 'Most Recently Visited' : 'Most Recently Visited - Cannot use unless MRV data is tracked';
}