document.getElementById('themeToggle').addEventListener('change', function () {
  var themeStyle = document.getElementById('themeStyle');
  if (this.checked) {
    themeStyle.innerHTML = `
      :root {
        --background-color: #333;
        --text-color: #fff;
        --input-background: #555;
        --input-color: #fff;
      }
    `;
  } else {
    themeStyle.innerHTML = `
      :root {
        --background-color: #fff;
        --text-color: #000;
        --input-background: #fff;
        --input-color: #000;
      }
    `;
  }
});

document.getElementById('searchButton').addEventListener('click', function () {
  var query = document.getElementById('searchBox').value;
  // You can add code here to perform the search and display the results.
});