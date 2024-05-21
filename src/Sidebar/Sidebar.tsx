import React, { useReducer, useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  createTheme,
  CssBaseline,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import browser from "webextension-polyfill";
import Fuse from "fuse.js";

import { SortMethod } from "../Shared/SortMethod";
import MessagePanel, {
  InfoMessage,
  WarningMessage,
  ErrorMessage,
  infoMessage,
  warningMessage,
  errorMessage,
  Message,
} from "../Shared/Components/MessagePanel";
import { logDebug } from "../Shared/Logger";
import { switchToTab } from "../Shared/Chrome";
import * as Events from "../State/StateEvents";
import {
  Tab,
  TabeuratorState,
  tabFromFirefoxTab,
} from "../State/TabeuratorState";

// Define a styled component using Emotion
const StyledBox = styled(Box)({
  borderRadius: "0.5em",
  padding: "0.25em",
  margin: 0,
});

const SearchBox: React.FC<{
  query: string;
  onQueryChange: (newQuery: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}> = ({ query, onQueryChange, onKeyDown, inputRef }) => (
  <TextField
    style={{ width: "100%" }}
    value={query}
    onChange={(event) => onQueryChange(event.target.value)}
    onKeyDown={onKeyDown}
    inputRef={inputRef}
  />
);

const ResultsList: React.FC<{
  tabs: Tab[];
  onKeyDown: (event: React.KeyboardEvent) => void;
  onListItemClick: (tab: Tab) => void;
}> = ({ tabs, onKeyDown, onListItemClick }) => (
  <List onKeyDown={onKeyDown}>
    {tabs.map((tab, index) => (
      <ListItemButton
        key={index}
        id={`listItem-${index}`}
        onClick={() => onListItemClick(tab)}
        sx={{
          padding: "0.1em",
          margin: 0,
        }}
      >
        <ListItemAvatar
          sx={{
            padding: "0.5em",
            margin: 0,
            minWidth: 0,
            maxWidth: 100,
          }}
        >
          <Avatar
            alt=""
            // TODO: Return Tabeurator favicon (or something else) instead of empty string
            src={tab.favIconUrl?.startsWith("chrome://") ? "" : tab.favIconUrl}
            sx={{
              width: "2em",
              height: "2em",
              margin: 0,
              padding: 0,
              maxWidth: 100,
              minWidth: 0,
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={tab.title}
          sx={{
            // padding: "0.1em 0.5em 0.1em 0.5em", // top, right, bottom, left
            padding: "0.1em 0.5em", // top/bottom, right/left
            margin: 0,
            overflow: "hidden",
            maxHeight: "3em",
          }}
        />
      </ListItemButton>
    ))}
  </List>
);

type State = {
  query: string;
  focusIndex: number | null;
  displayedTabs: Tab[];
  messages: Message[];
  data: {
    tabs: Tab[];
    config: any;
  };
  tabeuratorState: TabeuratorState;
};

type Action =
  | { type: "setQuery"; payload: string }
  | { type: "setFocusIndex"; payload: number | null }
  | { type: "setDisplayedTabs"; payload: Tab[] }
  | { type: "addMessages"; payload: Message[] }
  | { type: "removeMessages"; payload: Message[] }
  | { type: "setData"; payload: { tabs: Tab[]; config: any } }
  | { type: "setTabeuratorState"; payload: TabeuratorState };

// Action helpers
const setQuery = (dispatch: React.Dispatch<Action>, query: string): void => {
  dispatch({ type: "setQuery", payload: query });
};

const setFocusIndex = (
  dispatch: React.Dispatch<Action>,
  focusIndex: number | null
): void => {
  dispatch({ type: "setFocusIndex", payload: focusIndex });
};

const setDisplayedTabs = (
  dispatch: React.Dispatch<Action>,
  tabs: Tab[]
): void => {
  dispatch({ type: "setDisplayedTabs", payload: tabs });
};

const addMessages = (
  dispatch: React.Dispatch<Action>,
  messages: Message[]
): void => {
  dispatch({ type: "addMessages", payload: messages });
};

const removeMessages = (
  dispatch: React.Dispatch<Action>,
  messages: Message[]
): void => {
  dispatch({ type: "removeMessages", payload: messages });
};

const setData = (
  dispatch: React.Dispatch<Action>,
  data: {
    tabs: Tab[];
    config: any;
  }
): void => {
  dispatch({ type: "setData", payload: data });
};

const setTabeuratorState = (
  dispatch: React.Dispatch<Action>,
  tabeuratorState: TabeuratorState
): void => {
  dispatch({ type: "setTabeuratorState", payload: tabeuratorState });
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setQuery":
      return { ...state, query: action.payload };
    case "setFocusIndex":
      return { ...state, focusIndex: action.payload };
    case "setDisplayedTabs":
      return { ...state, displayedTabs: action.payload };
    case "addMessages": {
      action.payload.forEach((message) => {
        if (!state.messages.includes(message)) {
          state.messages.push(message);
        }
      });
      return state;
    }
    case "removeMessages": {
      action.payload.forEach((message) => {
        const index = state.messages.indexOf(message);
        if (index !== -1) {
          // returns everything except for the index item (effectively removing it)
          state.messages.splice(index, 1);
        }
      });
      return state;
    }
    case "setData":
      return { ...state, data: action.payload };
    // TODO: should probably display a message on the message panel when this happens
    default:
      return state;
  }
};

const initialState: State = {
  query: "",
  focusIndex: null,
  displayedTabs: [],
  messages: [],
  data: {
    tabs: [],
    config: {},
  },
  tabeuratorState: {
    tabs: [],
    windows: [],
    mostRecentlyViewed: [],
  },
};

module Messages {
  export const mrvOrderEmpty = warningMessage({
    message:
      "Most Recently Visited sort method is enabled, but no tabs have been visited yet.",
    resolution:
      "Visit at least 1 tab to populate the Most Recently Visited order.",
  });
}

// Moving into a useEffect block for scope reasons
// document.addEventListener("DOMContentLoaded", () => {
//   chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
//     if (
//       message.stateUpdateEvent != undefined &&
//       Events.isStateUpdateEvent(message.stateUpdateEvent)
//     ) {
//       console.log("TODO: StateUpdateEvent", message.stateUpdateEvent);
//     } else {
//       console.log(
//         "Unknown event type received in Sidebar, discarding:",
//         message
//       );
//     }
//   });
// });

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const getCurrentTab = async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tabs[0];
  };

  useEffect(() => {
    // chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    //   if (Events.isStateUpdateEventMessage(message)) {
    //     console.log("Received StateUpdateEvent", message.stateUpdateEvent);

    //     setTabeuratorState(dispatch, message.stateUpdateEvent.newState);

    //     console.log("State updated", state);
    //   } else {
    //     console.log(
    //       "Unknown event type received in Sidebar, discarding:",
    //       message
    //     );
    //   }
    // });
    const fetchData = async () => {
      const allTabs = await browser.tabs.query({});
      const result = await browser.storage.local.get("sort-method");
      const mrvOrder = await browser.runtime.sendMessage({
        type: "getMrvOrder",
      });
      const currentTab = await getCurrentTab();

      // filter out the current tab from the list
      const allOtherTabs = allTabs
        .map(tabFromFirefoxTab)
        .filter((tab) => tab.id !== currentTab.id);

      setData(dispatch, {
        tabs: allOtherTabs,
        config: { sortOrder: result["sort-method"], mrvOrder },
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    logDebug("Sort order:", state.data.config.sortOrder);
    logDebug("MRV order:", state.data.config.mrvOrder);

    let processedTabs = [...state.data.tabs];

    logDebug(
      "Tabs before sorting:",
      processedTabs.map((tab) => tab.id)
    );

    if (state.data.config.sortOrder === SortMethod.Alphabetical) {
      processedTabs.sort((a, b) => a.title?.localeCompare(b.title || "") || 0);
    } else if (state.data.config.sortOrder === SortMethod.MostRecentlyVisited) {
      if (state.data.config.mrvOrder.length > 0) {
        processedTabs.sort((a, b) => {
          const indexA = state.data.config.mrvOrder.indexOf(a.id);
          const indexB = state.data.config.mrvOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          else if (indexA === -1) return 1;
          else if (indexB === -1) return -1;
          else return indexA - indexB;
        });
      } else {
        addMessages(dispatch, [Messages.mrvOrderEmpty]);
      }
    }

    logDebug(
      "Tabs after sorting:",
      processedTabs.map((tab) => tab.id)
    );

    if (state.query !== "") {
      const fuse = new Fuse(processedTabs, {
        keys: ["title"],
        shouldSort: state.data.config.sortOrder === SortMethod.FuzzySearchScore,
      });
      processedTabs = fuse.search(state.query).map((result) => result.item);
    }

    setDisplayedTabs(dispatch, processedTabs);
  }, [state.data, state.query]);

  // Check if the user prefers dark mode
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  // Create a theme with dark mode if the user prefers it
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  const handleSearchBoxKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(dispatch, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(dispatch, state.displayedTabs.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (state.displayedTabs.length > 0) {
        switchToTab(state.displayedTabs[0].id!);
      }
    }
  };

  const handleListItemKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(
        dispatch,
        state.focusIndex === null ||
          state.focusIndex >= state.displayedTabs.length - 1
          ? null
          : state.focusIndex + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(
        dispatch,
        state.focusIndex === null || state.focusIndex <= 0
          ? null
          : state.focusIndex - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (
        state.focusIndex !== null &&
        state.focusIndex < state.displayedTabs.length
      ) {
        switchToTab(state.displayedTabs[state.focusIndex].id!);
      }
    }
  };

  const handleListItemClick = (tab: Tab) => {
    switchToTab(tab.id!);
  };

  useEffect(() => {
    if (state.focusIndex === null) {
      setTimeout(() => {
        searchBoxRef.current?.focus();
      }, 50);
    } else {
      document.getElementById(`listItem-${state.focusIndex}`)?.focus();
    }
  }, [state.focusIndex]);

  return (
    <Box>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StyledBox>
          <SearchBox
            query={state.query}
            onQueryChange={(newQuery) => setQuery(dispatch, newQuery)}
            onKeyDown={handleSearchBoxKeyDown}
            inputRef={searchBoxRef}
          />
          <MessagePanel messages={state.messages} />
          <ResultsList
            tabs={state.displayedTabs}
            onKeyDown={handleListItemKeyDown}
            onListItemClick={handleListItemClick}
          />
        </StyledBox>
      </ThemeProvider>
    </Box>
  );
};

export default App;
