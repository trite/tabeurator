import browser from "webextension-polyfill";

import { logDebug } from "../Shared/Logger";
import {
  TabeuratorState,
  tabFromChromeTab,
  windowFromChromeWindow,
} from "./TabeuratorState";
import * as Events from "./StateEvents";

// Shared global state, gonna use eventing/messaging to try and tame the beast
let state: TabeuratorState = {
  tabs: [],
  windows: [],
  mostRecentlyViewed: [],
};

const sendUpdatedState = async () => {
  console.log("Notifying of state update:", state);
  await chrome.runtime.sendMessage({
    stateUpdateEvent: Events.stateUpdateEvent(state),
  });
};

const updateStateFromBrowser = async () => {
  const tabs = await chrome.tabs.query({});
  const windows = await chrome.windows.getAll({});
  state = {
    tabs: tabs.map(tabFromChromeTab),
    windows: windows.map(windowFromChromeWindow),
    mostRecentlyViewed: state.mostRecentlyViewed, // retain MRV order
  };
};

// Called by background.ts when the appropriate events happen
export module Handlers {
  export const windowCreated = async (window: chrome.windows.Window) => {
    logDebug("Handle Window Created stuff", window);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const windowFocusChanged = async (windowId: number) => {
    logDebug("Handle Window Focus Changed stuff", windowId);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const windowRemoved = async (windowId: number) => {
    logDebug("Handle Window Removed stuff", windowId);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const tabActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    logDebug("Handle Tab Activated stuff", activeInfo);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const tabCreated = async (tab: chrome.tabs.Tab) => {
    logDebug("Handle Tab Created stuff", tab);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const tabRemoved = async (
    tabId: number,
    removeInfo: chrome.tabs.TabRemoveInfo
  ) => {
    logDebug("Handle Tab Removed stuff", tabId, removeInfo);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };

  export const tabUpdated = async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    logDebug("Handle Tab Updated stuff", tabId, changeInfo, tab);

    // TODO: Just update current state rather than pull everything each time
    //       This is just to keep it simple for now, but it's not efficient
    await updateStateFromBrowser();

    await sendUpdatedState();
  };
}
