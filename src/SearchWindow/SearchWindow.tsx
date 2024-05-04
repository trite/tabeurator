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
} from "./MessagePanel";

// Define a styled component using Emotion
const StyledBox = styled(Box)({
  borderRadius: "5px",
  padding: "10px",
  margin: "10px",
});

// Define the SearchBox component
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

// Define the ResultsList component
const ResultsList: React.FC<{
  tabs: browser.Tabs.Tab[];
  onKeyDown: (event: React.KeyboardEvent) => void;
  onListItemClick: (tab: browser.Tabs.Tab) => void;
}> = ({ tabs, onKeyDown, onListItemClick }) => (
  <List onKeyDown={onKeyDown}>
    {tabs.map((tab, index) => (
      <ListItemButton
        key={index}
        id={`listItem-${index}`}
        onClick={() => onListItemClick(tab)}
      >
        <ListItemAvatar>
          <Avatar
            alt=""
            // TODO: Return Tabeurator favicon (or something else) instead of empty string
            src={tab.favIconUrl?.startsWith("chrome://") ? "" : tab.favIconUrl}
            sx={{ width: 24, height: 24 }}
          />
        </ListItemAvatar>
        <ListItemText primary={tab.title} />
      </ListItemButton>
    ))}
  </List>
);

type State = {
  query: string;
  focusIndex: number | null;
  displayedTabs: browser.Tabs.Tab[];
  messages: Message[];
  data: {
    tabs: browser.Tabs.Tab[];
    config: any;
  };
};

type Action =
  | { type: "setQuery"; payload: string }
  | { type: "setFocusIndex"; payload: number | null }
  | { type: "setDisplayedTabs"; payload: browser.Tabs.Tab[] }
  | { type: "setMessages"; payload: Message[] }
  | { type: "setData"; payload: { tabs: browser.Tabs.Tab[]; config: any } };

// Action helpers
function setQuery(dispatch: React.Dispatch<Action>, query: string): void {
  dispatch({ type: "setQuery", payload: query });
}

function setFocusIndex(
  dispatch: React.Dispatch<Action>,
  focusIndex: number | null
): void {
  dispatch({ type: "setFocusIndex", payload: focusIndex });
}

function setDisplayedTabs(
  dispatch: React.Dispatch<Action>,
  tabs: browser.Tabs.Tab[]
): void {
  dispatch({ type: "setDisplayedTabs", payload: tabs });
}

function setMessages(
  dispatch: React.Dispatch<Action>,
  messages: Message[]
): void {
  dispatch({ type: "setMessages", payload: messages });
}

function setData(
  dispatch: React.Dispatch<Action>,
  data: {
    tabs: browser.Tabs.Tab[];
    config: any;
  }
): void {
  dispatch({ type: "setData", payload: data });
}

// Define the reducer function
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setQuery":
      return { ...state, query: action.payload };
    case "setFocusIndex":
      return { ...state, focusIndex: action.payload };
    case "setDisplayedTabs":
      return { ...state, displayedTabs: action.payload };
    case "setMessages":
      return { ...state, messages: action.payload };
    case "setData":
      return { ...state, data: action.payload };
    // TODO: should probably display a message on the message panel when this happens
    default:
      return state;
  }
}

// Define the initial state
const initialState: State = {
  query: "",
  focusIndex: null,
  displayedTabs: [],
  messages: [],
  data: {
    tabs: [],
    config: {},
  },
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const getCurrentTab = () => {
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const allTabs = await browser.tabs.query({});
      const result = await browser.storage.local.get("sort-method");
      const mruOrder = await browser.runtime.sendMessage({
        type: "getMruOrder",
      });
      const currentTab = await getCurrentTab();

      // filter out the current tab from the list
      const allOtherTabs = allTabs.filter((tab) => tab.id !== currentTab.id);

      setData(dispatch, {
        tabs: allOtherTabs,
        config: { sortOrder: result["sort-method"], mruOrder },
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Sort order:", state.data.config.sortOrder);
    console.log("MRU order:", state.data.config.mruOrder);

    let processedTabs = [...state.data.tabs];

    console.log(
      "Tabs before sorting:",
      processedTabs.map((tab) => tab.id)
    );

    if (state.data.config.sortOrder === SortMethod.Alphabetical) {
      processedTabs.sort((a, b) => a.title?.localeCompare(b.title || "") || 0);
    } else if (state.data.config.sortOrder === SortMethod.MostRecentlyUpdated) {
      if (state.data.config.mruOrder.length > 0) {
        processedTabs.sort((a, b) => {
          const indexA = state.data.config.mruOrder.indexOf(a.id);
          const indexB = state.data.config.mruOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          else if (indexA === -1) return 1;
          else if (indexB === -1) return -1;
          else return indexA - indexB;
        });
      } else {
        setMessages(
          dispatch,
          state.messages.concat(
            warningMessage({
              message:
                "Most Recently Updated sort method is enabled, but no tabs have been visited yet.",
              resolution: "Visit at least 1 tab to populate the MRU order.",
            })
          )
        );
      }
    }

    console.log(
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

  const switchToTab = (newTabId: number) =>
    chrome.tabs.update(newTabId, { active: true }, () => window.close());

  const handleSearchBoxKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(dispatch, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(dispatch, state.data.tabs.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (state.data.tabs.length > 0) {
        switchToTab(state.data.tabs[0].id!);
      }
    }
  };

  const handleListItemKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(
        dispatch,
        state.focusIndex === null ||
          state.focusIndex >= state.data.tabs.length - 1
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
        state.focusIndex < state.data.tabs.length
      ) {
        switchToTab(state.data.tabs[state.focusIndex].id!);
      }
    }
  };

  const handleListItemClick = (tab: browser.Tabs.Tab) => {
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
    <Box width={800}>
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
