import React, { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import browser from "webextension-polyfill";

import { SortMethod } from "../Shared/SortMethod";
import { BrowserType, getBrowserType } from "../Shared/Chrome";

const commandName = "_execute_browser_action";
const defaultShortcut = "Ctrl+Shift+Space";

interface ShortcutComponentProps {
  shortcut: string;
  setShortcut: (value: string) => void;
  updateShortcut: (event: MouseEvent<HTMLButtonElement>) => void;
  resetShortcut: (event: MouseEvent<HTMLButtonElement>) => void;
}

const ShortcutComponent: React.FC<ShortcutComponentProps> = ({
  shortcut,
  setShortcut,
  updateShortcut,
  resetShortcut,
}) => {
  switch (getBrowserType()) {
    case BrowserType.Chrome:
      return (
        <p>
          Keyboard shortcuts for Chrome browsers must be set at:
          chrome://extensions/shortcuts
        </p>
      );
    case BrowserType.Firefox:
    case BrowserType.Unknown:
    default:
      // For now assume all non-chrome browsers can set shortcuts
      return (
        <>
          <label htmlFor="shortcut">Keyboard shortcut</label>
          <input
            type="text"
            id="shortcut"
            value={shortcut}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setShortcut(e.target.value)
            }
          />
          <button type="button" onClick={updateShortcut}>
            Update keyboard shortcut
          </button>
          <button type="button" onClick={resetShortcut}>
            Reset keyboard shortcut
          </button>
        </>
      );
  }
};

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
    // console.log("updateShortcut", shortcut);
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
      <ShortcutComponent
        shortcut={shortcut}
        setShortcut={setShortcut}
        updateShortcut={updateShortcut}
        resetShortcut={resetShortcut}
      />

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
