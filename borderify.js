document.body.style.border = "5px solid red";

console.log("borderify.js loaded!");

document.addEventListener('keydown', function (event) {
  // Check if Ctrl+Shift+F was pressed
  if (event.ctrlKey && event.shiftKey && event.key === '`') {
    // Prevent default action to avoid interfering with other shortcuts
    event.preventDefault();
    console.log('Ctrl+Shift+` was pressed!')
    // Call your function to open the search box
    openSearchBox();
  }
});

function openSearchBox() {
  // Create the search box element
  const searchBox = document.createElement('input');
  searchBox.setAttribute('type', 'text');
  searchBox.setAttribute('id', 'myExtensionSearchBox');
  searchBox.style.position = 'fixed';
  searchBox.style.top = '20px';
  searchBox.style.left = '20px';
  searchBox.style.zIndex = '10000'; // Ensure it appears above other content

  // Append the search box to the body
  document.body.appendChild(searchBox);

  // Move focus to the new search box
  searchBox.focus();
}
