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

// Focus search box on popup open. The timeout is a workaround,
//   without it the focus doesn't happen 100% of the time
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('searchBox').focus();
  }, 50);
});

var searchBox = document.getElementById('searchBox');

// Search for tabs on search box input change
searchBox.addEventListener('input', function (event) {
  var query = event.target.value.toLowerCase();

  chrome.tabs.query({}, function (tabs) {
    var matchingTabs = tabs.filter(function (tab) {
      return tab.title.toLowerCase().includes(query);
    }).slice(0, 10); // Limit to the first 10 matches

    var resultsList = document.createElement('ul');
    matchingTabs.forEach(function (tab, index) {
      var listItem = document.createElement('li');
      listItem.textContent = tab.title;
      listItem.style.cursor = 'pointer'; // Change cursor to pointer when hovering over the list item
      listItem.tabIndex = 0; // Set tabIndex to make the list item selectable with keyboard
      listItem.addEventListener('click', function () {
        chrome.tabs.update(tab.id, { active: true }); // Switch to the selected tab
        window.close(); // Close the popup
      });
      listItem.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown') {
          // Move focus to the next list item, or loop back to the search box if the current item is the last one
          var nextItem = listItem.nextSibling || searchBox;
          nextItem.focus();
        } else if (event.key === 'ArrowUp') {
          // Move focus to the previous list item, or loop back to the search box if the current item is the first one
          var previousItem = listItem.previousSibling || searchBox;
          previousItem.focus();
        } else if (event.key === 'Enter') {
          // Select the current list item
          listItem.click();
        }
      });
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

// Add keydown event listener to the search box
searchBox.addEventListener('keydown', function (event) {
  var resultsDiv = document.getElementById('results');
  if (event.key === 'ArrowDown') {
    // Move focus to the first list item when the down arrow key is pressed
    if (resultsDiv.firstChild && resultsDiv.firstChild.firstChild) {
      resultsDiv.firstChild.firstChild.focus();
    }
  } else if (event.key === 'ArrowUp') {
    // Move focus to the last list item when the up arrow key is pressed
    if (resultsDiv.firstChild && resultsDiv.firstChild.lastChild) {
      resultsDiv.firstChild.lastChild.focus();
    }
  }
});