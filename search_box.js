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

chrome.storage.local.get('theme', (items) => {
  var theme = items.theme;
  var body = document.body;
  var searchBox = document.getElementById('searchBox');
  if (theme === 'dark') {
    setDarkMode(body, searchBox);
    document.getElementById('themeToggle').checked = true;
  } else {
    setLightMode(body, searchBox);
    document.getElementById('themeToggle').checked = false;
  }
});

// browser.storage.local.get().then((data) => {
//   console.log(data);
// }, (error) => {
//   console.error('Failed to retrieve data from storage:', error);
// });

// // When the popup is opened, retrieve the current theme from storage and apply it.
// storage.local.get('theme').then((data) => {
//   var theme = data.theme;
//   var body = document.body;
//   var searchBox = document.getElementById('searchBox');
//   if (theme === 'dark') {
//     setDarkMode(body, searchBox);
//     document.getElementById('themeToggle').checked = true;
//   } else {
//     setLightMode(body, searchBox);
//     document.getElementById('themeToggle').checked = false;
//   }
// }, (error) => {
//   console.error('Failed to retrieve theme from storage:', error);
// };

// When the theme toggle is changed, update the theme in storage.
document.getElementById('themeToggle').addEventListener('change', function () {
  var body = document.body;
  var searchBox = document.getElementById('searchBox');
  if (this.checked) {
    setDarkMode(body, searchBox);
    chrome.storage.local.set({ theme: 'dark' });
  } else {
    setLightMode(body, searchBox);
    chrome.storage.local.set({ theme: 'light' });
  }
});

// When the search box input changes, perform a search.
document.getElementById('searchBox').addEventListener('input', function () {
  var query = this.value;
  // You can add code here to perform the search and display the results.
});