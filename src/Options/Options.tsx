import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { SortMethod } from "../Shared/SortMethod";

const commandName = "_execute_browser_action";
const defaultShortcut = "Ctrl+Shift+Space";

const Options = () => {
  const [shortcut, setShortcut] = useState("");
  const [trackMru, setTrackMru] = useState(true);
  const [sortMethod, setSortMethod] = useState(SortMethod.MostRecentlyUpdated);

  useEffect(() => {
    const updateUI = async () => {
      let commands = await browser.commands.getAll();
      for (let command of commands) {
        if (command.name === commandName) {
          setShortcut(command.shortcut!);
        }
      }
    };

    const loadSettings = async () => {
      const { "track-mru": trackMru, "sort-method": sortMethod } =
        await browser.storage.local.get(["track-mru", "sort-method"]);
      setTrackMru(trackMru !== undefined ? trackMru : true); // Default to true
      setSortMethod(sortMethod || SortMethod.MostRecentlyUpdated); // Default to MRU sorting
    };

    updateUI();
    loadSettings();
  }, []);

  const updateShortcut = async () => {
    await browser.commands.update({
      name: commandName,
      shortcut: shortcut,
    });
  };

  const resetShortcut = async () => {
    await browser.commands.reset(commandName);
    setShortcut(defaultShortcut);
  };

  const handleTrackMruChange = (event: { target: { checked: boolean } }) => {
    const trackMru = event.target.checked;
    setTrackMru(trackMru);
    browser.storage.local.set({ "track-mru": trackMru });
    if (!trackMru && sortMethod === SortMethod.MostRecentlyUpdated) {
      setSortMethod(SortMethod.Alphabetical);
      browser.storage.local.set({ "sort-method": SortMethod.Alphabetical });
    }
  };

  const handleSortMethodChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    const value = event.target.value as SortMethod;
    setSortMethod(value);
    browser.storage.local.set({ "sort-method": value });
  };

  return (
    <form>
      <label htmlFor="shortcut">Keyboard shortcut</label>
      <input
        type="text"
        id="shortcut"
        value={shortcut}
        onChange={(e) => setShortcut(e.target.value)}
      />
      <button type="button" onClick={updateShortcut}>
        Update keyboard shortcut
      </button>
      <button type="button" onClick={resetShortcut}>
        Reset keyboard shortcut
      </button>

      <br />

      <label htmlFor="track-mru">Track Most Recently Used:</label>
      <input
        type="checkbox"
        id="track-mru"
        checked={trackMru}
        onChange={handleTrackMruChange}
      />

      <br />

      <label htmlFor="sort-method">Sort method:</label>
      <select
        id="sort-method"
        value={sortMethod}
        onChange={handleSortMethodChange}
      >
        <option value={SortMethod.FuzzySearchScore}>Fuzzy Search Score</option>
        <option value={SortMethod.Alphabetical}>Alphabetical</option>
        <option value={SortMethod.MostRecentlyUpdated} disabled={!trackMru}>
          {trackMru
            ? "Most Recently Used"
            : "Most Recently Used - Cannot use unless MRU data is tracked"}
        </option>
      </select>
    </form>
  );
};

export default Options;
