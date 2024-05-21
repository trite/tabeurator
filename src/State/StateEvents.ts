import { TabeuratorState } from "./TabeuratorState";

export type EventBase = {
  eventType: string;
};

export type StateUpdateEvent = EventBase & {
  eventType: "StateUpdateEvent";
  newState: TabeuratorState;
};

export const stateUpdateEvent = (
  newState: TabeuratorState
): StateUpdateEvent => ({
  eventType: "StateUpdateEvent",
  newState,
});

export const isStateUpdateEvent = (
  event: EventBase
): event is StateUpdateEvent => {
  return event.eventType === "StateUpdateEvent";
};

export const isStateUpdateEventMessage = (
  message: any
): message is { stateUpdateEvent: StateUpdateEvent } => {
  return isStateUpdateEvent(message.stateUpdateEvent);
};

// export type EventBase = {
//   eventType: string;
// };

// export type InitializationEvent = EventBase & {
//   eventType: "InitializationEvent";
//   tabs: chrome.tabs.Tab[];
//   windows: chrome.windows.Window[];
// };

// const isInitializationEvent = (
//   event: EventBase
// ): event is InitializationEvent => {
//   return event.eventType === "InitializationEvent";
// };

// export type TabActivatedEvent = EventBase & {
//   eventType: "tabActivatedEvent";
//   activeInfo: chrome.tabs.TabActiveInfo;
// };

// const isTabActivatedEvent = (event: EventBase): event is TabActivatedEvent => {
//   return event.eventType === "tabActivatedEvent";
// };

// export const tabActivatedEvent = (
//   activeInfo: chrome.tabs.TabActiveInfo
// ): TabActivatedEvent => ({
//   eventType: "tabActivatedEvent",
//   activeInfo,
// });

// export type TabCreatedEvent = EventBase & {
//   eventType: "TabCreatedEvent";
//   tab: chrome.tabs.Tab;
// };

// const isTabCreatedEvent = (event: EventBase): event is TabCreatedEvent => {
//   return event.eventType === "TabCreatedEvent";
// };

// export const tabCreatedEvent = (tab: chrome.tabs.Tab): TabCreatedEvent => ({
//   eventType: "TabCreatedEvent",
//   tab,
// });

// export type TabRemovedEvent = EventBase & {
//   eventType: "TabRemovedEvent";
//   tabId: number;
//   removeInfo: chrome.tabs.TabRemoveInfo;
// };

// const isTabRemovedEvent = (event: EventBase): event is TabRemovedEvent => {
//   return event.eventType === "TabRemovedEvent";
// };

// export const tabRemovedEvent = (
//   tabId: number,
//   removeInfo: chrome.tabs.TabRemoveInfo
// ): TabRemovedEvent => ({
//   eventType: "TabRemovedEvent",
//   tabId,
//   removeInfo,
// });

// export type TabUpdatedEvent = EventBase & {
//   eventType: "TabUpdatedEvent";
//   tab: chrome.tabs.Tab;
//   changeInfo: chrome.tabs.TabChangeInfo;
// };

// const isTabUpdatedEvent = (event: EventBase): event is TabUpdatedEvent => {
//   return event.eventType === "TabUpdatedEvent";
// };

// export const tabUpdatedEvent = (
//   tab: chrome.tabs.Tab,
//   changeInfo: chrome.tabs.TabChangeInfo
// ): TabUpdatedEvent => ({
//   eventType: "TabUpdatedEvent",
//   tab,
//   changeInfo,
// });

// export type TabEvent =
//   | TabActivatedEvent
//   | TabCreatedEvent
//   | TabRemovedEvent
//   | TabUpdatedEvent;

// export type WindowCreatedEvent = EventBase & {
//   eventType: "WindowCreatedEvent";
//   window: chrome.windows.Window;
// };

// const isWindowCreatedEvent = (
//   event: EventBase
// ): event is WindowCreatedEvent => {
//   return event.eventType === "WindowCreatedEvent";
// };

// export const windowCreatedEvent = (
//   window: chrome.windows.Window
// ): WindowCreatedEvent => ({
//   eventType: "WindowCreatedEvent",
//   window,
// });

// export type WindowRemovedEvent = EventBase & {
//   eventType: "WindowRemovedEvent";
//   windowId: number;
// };

// const isWindowRemovedEvent = (
//   event: EventBase
// ): event is WindowRemovedEvent => {
//   return event.eventType === "WindowRemovedEvent";
// };

// export const windowRemovedEvent = (windowId: number): WindowRemovedEvent => ({
//   eventType: "WindowRemovedEvent",
//   windowId,
// });

// export type WindowFocusChangedEvent = EventBase & {
//   eventType: "WindowFocusChangedEvent";
//   windowId: number;
// };

// const isWindowFocusChangedEvent = (
//   event: EventBase
// ): event is WindowFocusChangedEvent => {
//   return event.eventType === "WindowFocusChangedEvent";
// };

// export const windowFocusChangedEvent = (
//   windowId: number
// ): WindowFocusChangedEvent => ({
//   eventType: "WindowFocusChangedEvent",
//   windowId,
// });

// export type WindowEvent =
//   | WindowCreatedEvent
//   | WindowRemovedEvent
//   | WindowFocusChangedEvent;

// export type StateUpdateEvent = InitializationEvent | TabEvent | WindowEvent;

// export const isStateUpdateEvent = (
//   event: EventBase
// ): event is StateUpdateEvent => {
//   return (
//     isInitializationEvent(event) ||
//     isTabActivatedEvent(event) ||
//     isTabCreatedEvent(event) ||
//     isTabRemovedEvent(event) ||
//     isTabUpdatedEvent(event) ||
//     isWindowCreatedEvent(event) ||
//     isWindowRemovedEvent(event) ||
//     isWindowFocusChangedEvent(event)
//   );
// };

// export type StateUpdateEventShape = { stateUpdatedEvent: StateUpdateEvent };
