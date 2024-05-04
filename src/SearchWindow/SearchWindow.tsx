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
          <Avatar alt="" src={tab.favIconUrl} sx={{ width: 24, height: 24 }} />
        </ListItemAvatar>
        <ListItemText primary={tab.title} />
      </ListItemButton>
    ))}
  </List>
);

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  const [tabs, setTabs] = useState<browser.Tabs.Tab[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch the tabs when the component mounts

    browser.runtime.sendMessage({ type: "getMruOrder" }).then((mruOrder) => {
      // Get all the tabs
      return browser.tabs.query({}).then((allTabs) => {
        // Sort the tabs based on the MRU order
        const sortedTabs = allTabs.sort((a, b) => {
          const indexA = mruOrder.indexOf(a.id);
          const indexB = mruOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          else if (indexA === -1) return 1;
          else if (indexB === -1) return -1;
          else return indexA - indexB;
        });
        setTabs(sortedTabs);
      });
    });

    // Focus the search box when the component mounts
    setTimeout(() => {
      searchBoxRef.current?.focus();
    }, 50);
  }, []);

  const filteredTabs = tabs.filter((tab) =>
    tab.title?.toLowerCase().includes(query.toLowerCase())
  );

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
      setFocusIndex(filteredTabs.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (filteredTabs.length > 0) {
        switchToTab(filteredTabs[0].id!);
      }
    }
  };

  const handleListItemKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(
        focusIndex === null || focusIndex >= filteredTabs.length - 1
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
      if (focusIndex !== null && focusIndex < filteredTabs.length) {
        switchToTab(filteredTabs[focusIndex].id!);
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
          <ResultsList
            tabs={filteredTabs}
            onKeyDown={handleListItemKeyDown}
            onListItemClick={handleListItemClick}
          />
        </StyledBox>
      </ThemeProvider>
    </Box>
  );
};

export default App;
