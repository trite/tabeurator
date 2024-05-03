let setDarkMode = (body, searchBox) => {
  body.classList.remove('light-mode');
  body.classList.add('dark-mode');
  searchBox.classList.remove('light-mode');
  searchBox.classList.add('dark-mode');
};

let setLightMode = (body, searchBox) => {
  body.classList.remove('dark-mode');
  body.classList.add('light-mode');
  searchBox.classList.remove('dark-mode');
  searchBox.classList.add('light-mode');
};

// When the popup is opened, retrieve the current theme from storage and apply it.
chrome.storage.local.get('theme', (items) => {
  var theme = items.theme;
  var body = document.body;
  var searchBox = document.getElementById('searchBox');
  if (theme === 'dark') {
    setDarkMode(body, searchBox);
  } else {
    setLightMode(body, searchBox);
  }
});

// When the search box input changes, perform a search.
document.getElementById('searchBox').addEventListener('input', (event) => {
  var query = event.target.value;

  // TODO: implement search

  document.getElementById('results').textContent = 'Search results for: ' + query;
});

// Focus search box on popup open. The timeout is a workaround,
//   without it the focus doesn't happen 100% of the time
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('searchBox').focus();
  }, 50);
});