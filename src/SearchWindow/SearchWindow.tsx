import React, { useState, useEffect, useRef } from "react";
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

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  // const [tabs, setTabs] = useState<browser.Tabs.Tab[]>([]);
  // const [config, setConfig] = useState<any>({});
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [displayedTabs, setDisplayedTabs] = useState<browser.Tabs.Tab[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [data, setData] = useState<{ tabs: browser.Tabs.Tab[]; config: any }>({
    tabs: [],
    config: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      const allTabs = await browser.tabs.query({});
      const result = await browser.storage.local.get("sort-method");
      const mruOrder = await browser.runtime.sendMessage({
        type: "getMruOrder",
      });
      setData({
        tabs: allTabs,
        config: { sortOrder: result["sort-method"], mruOrder },
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Sort order:", data.config.sortOrder);
    console.log("MRU order:", data.config.mruOrder);

    let processedTabs = [...data.tabs];

    console.log(
      "Tabs before sorting:",
      processedTabs.map((tab) => tab.title)
    );

    if (data.config.sortOrder === SortMethod.Alphabetical) {
      processedTabs.sort((a, b) => a.title?.localeCompare(b.title || "") || 0);
    } else if (data.config.sortOrder === SortMethod.MostRecentlyUpdated) {
      if (data.config.mruOrder.length > 0) {
        processedTabs.sort((a, b) => {
          const indexA = data.config.mruOrder.indexOf(a.id);
          const indexB = data.config.mruOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          else if (indexA === -1) return 1;
          else if (indexB === -1) return -1;
          else return indexB - indexA;
        });
      } else {
        setMessages(
          messages.concat({
            type: "Warning",
            message:
              "Most Recently Updated sort method is enabled, but no tabs have been visited yet.",
            resolution: "Visit at least 1 tab to populate the MRU order.",
          })
        );
        // Raise a notification to the UI that MRU order is not yet populated
        // Maybe have it explain that this happens on first install
        //   until you visit at least 1 tab
      }
    }

    console.log(
      "Tabs after sorting:",
      processedTabs.map((tab) => tab.title)
    );

    if (query !== "") {
      const fuse = new Fuse(processedTabs, {
        keys: ["title"],
        shouldSort: data.config.sortOrder === SortMethod.FuzzySearchScore,
      });
      processedTabs = fuse.search(query).map((result) => result.item);
    }

    setDisplayedTabs(processedTabs);
  }, [data, query]);

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
      setFocusIndex(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(data.tabs.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (data.tabs.length > 0) {
        switchToTab(data.tabs[0].id!);
      }
    }
  };

  const handleListItemKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(
        focusIndex === null || focusIndex >= data.tabs.length - 1
          ? null
          : focusIndex + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(
        focusIndex === null || focusIndex <= 0 ? null : focusIndex - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusIndex !== null && focusIndex < data.tabs.length) {
        switchToTab(data.tabs[focusIndex].id!);
      }
    }
  };

  const handleListItemClick = (tab: browser.Tabs.Tab) => {
    switchToTab(tab.id!);
  };

  useEffect(() => {
    if (focusIndex === null) {
      setTimeout(() => {
        searchBoxRef.current?.focus();
      }, 50);
    } else {
      document.getElementById(`listItem-${focusIndex}`)?.focus();
    }
  }, [focusIndex]);

  return (
    <Box width={800}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StyledBox>
          <SearchBox
            query={query}
            onQueryChange={setQuery}
            onKeyDown={handleSearchBoxKeyDown}
            inputRef={searchBoxRef}
          />
          <MessagePanel messages={messages} />
          <ResultsList
            tabs={displayedTabs}
            onKeyDown={handleListItemKeyDown}
            onListItemClick={handleListItemClick}
          />
        </StyledBox>
      </ThemeProvider>
    </Box>
  );
};

export default App;
