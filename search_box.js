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
document.getElementById('searchBox').addEventListener('input', () => {
  var query = this.value;
  // TODO: implement search
});

// Focus search box on popup open
document.addEventListener('DOMContentLoaded', () => {

  var searchBox = document.getElementById('searchBox');
  searchBox.focus();
  // setTimeout(() => {
  //   var searchBox = document.getElementById('searchBox');
  //   searchBox.focus();
  // }, 0);
});
// document.addEventListener('DOMContentLoaded', (event) => {
//   console.log('DOM has loaded');
//   // document.querySelector('body').focus();
//   document.querySelector('searchBox').focus();
// }, false);

// console.log('popup.js loaded!');