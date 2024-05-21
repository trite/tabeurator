import { logDebug } from "../Shared/Logger";
import { TabeuratorState } from "./TabeuratorState";
import * as Events from "./StateEvents";

const sendUpdatedState = async (newState: TabeuratorState) => {
  console.log("Notifying of state update:", newState);
  await chrome.runtime.sendMessage({
    stateUpdateEvent: Events.stateUpdateEvent(newState),
  });
};

// Called by background.ts when the appropriate events happen
export module Handlers {
  const tempStateDeleteMe: TabeuratorState = {
    tabs: [],
    windows: [],
  };

  export const windowCreated = async (window: chrome.windows.Window) => {
    console.log("Handle Window Created stuff", window);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const windowFocusChanged = async (windowId: number) => {
    console.log("Handle Window Focus Changed stuff", windowId);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const windowRemoved = async (windowId: number) => {
    console.log("Handle Window Removed stuff", windowId);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const tabActivated = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    console.log("Handle Tab Activated stuff", activeInfo);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const tabCreated = async (tab: chrome.tabs.Tab) => {
    console.log("Handle Tab Created stuff", tab);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const tabRemoved = async (
    tabId: number,
    removeInfo: chrome.tabs.TabRemoveInfo
  ) => {
    console.log("Handle Tab Removed stuff", tabId, removeInfo);
    sendUpdatedState(tempStateDeleteMe);
  };

  export const tabUpdated = async (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    console.log("Handle Tab Updated stuff", tabId, changeInfo, tab);
    sendUpdatedState(tempStateDeleteMe);
  };
}
