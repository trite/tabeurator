import React, { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { SortMethod } from "../Shared/SortMethod";

const commandName = "_execute_browser_action";
const defaultShortcut = "Ctrl+Shift+Space";

const Options = () => {
  const [shortcut, setShortcut] = useState("");
  const [trackMrv, setTrackMrv] = useState(true);
  const [sortMethod, setSortMethod] = useState(SortMethod.MostRecentlyVisited);

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
      const { "track-mrv": trackMrv, "sort-method": sortMethod } =
        await browser.storage.local.get(["track-mrv", "sort-method"]);
      setTrackMrv(trackMrv !== undefined ? trackMrv : true); // Default to true
      setSortMethod(sortMethod || SortMethod.MostRecentlyVisited); // Default to MRV sorting
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

  const handleTrackMrvChange = (event: { target: { checked: boolean } }) => {
    const trackMrv = event.target.checked;
    setTrackMrv(trackMrv);
    browser.storage.local.set({ "track-mrv": trackMrv });
    if (!trackMrv && sortMethod === SortMethod.MostRecentlyVisited) {
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

      <label htmlFor="track-mrv">Track most recently visited (MRV) tabs:</label>
      <input
        type="checkbox"
        id="track-mrv"
        checked={trackMrv}
        onChange={handleTrackMrvChange}
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
        <option value={SortMethod.MostRecentlyVisited} disabled={!trackMrv}>
          {trackMrv
            ? "Most Recently Visited"
            : "Most Recently Visited - Cannot use unless MRV data is tracked"}
        </option>
      </select>
    </form>
  );
};

export default Options;
