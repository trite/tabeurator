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
document.getElementById('searchBox').addEventListener('input', function (event) {
  var query = event.target.value.toLowerCase();

  chrome.tabs.query({}, function (tabs) {
    var matchingTabs = tabs.filter(function (tab) {
      return tab.title.toLowerCase().includes(query);
    }).slice(0, 10); // Limit to the first 10 matches

    var resultsList = document.createElement('ul');
    matchingTabs.forEach(function (tab) {
      var listItem = document.createElement('li');
      listItem.textContent = tab.title;
      resultsList.appendChild(listItem);
    });

    var resultsDiv = document.getElementById('results');
    // Clear any previous results
    while (resultsDiv.firstChild) {
      resultsDiv.removeChild(resultsDiv.firstChild);
    }
    resultsDiv.appendChild(resultsList);
  });
});

// Focus search box on popup open. The timeout is a workaround,
//   without it the focus doesn't happen 100% of the time
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('searchBox').focus();
  }, 50);
});
