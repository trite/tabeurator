import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
  useMediaQuery,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import { styled } from "@mui/system";

// Define a styled component using Emotion
const StyledBox = styled(Box)({
  borderRadius: "5px",
  padding: "10px",
  margin: "10px",
});

type Tab = {
  title: string;
};

type TabItemProps = {
  tab: Tab;
};

const TabItem: React.FC<TabItemProps> = ({ tab }) => {
  return (
    <ListItem>
      <ListItemText primary={tab.title} />
    </ListItem>
  );
};

const ResultsList: React.FC<{
  tabs: chrome.tabs.Tab[];
  onKeyDown: (event: React.KeyboardEvent) => void;
}> = ({ tabs, onKeyDown }) => (
  <List onKeyDown={onKeyDown}>
    {tabs.map((tab, index) => (
      <ListItem button key={index} id={`listItem-${index}`}>
        <ListItemText primary={tab.title} />
      </ListItem>
    ))}
  </List>
);

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

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch the tabs when the component mounts
    chrome.tabs.query({}, (fetchedTabs) => {
      setTabs(fetchedTabs);
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusIndex(
        focusIndex === null || focusIndex >= filteredTabs.length - 1
          ? 0
          : focusIndex + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusIndex(
        focusIndex === null || focusIndex <= 0
          ? filteredTabs.length - 1
          : focusIndex - 1
      );
    }
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledBox>
        <SearchBox
          query={query}
          onQueryChange={setQuery}
          onKeyDown={handleKeyDown}
          inputRef={searchBoxRef}
        />
        <ResultsList tabs={filteredTabs} onKeyDown={handleKeyDown} />
      </StyledBox>
    </ThemeProvider>
  );
};

export default App;
