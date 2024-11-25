chrome.browserAction.onClicked.addListener((tab) => {
  const url = tab.url;

  // Check if the current tab is a PDF (both web URLs and local file URLs)
  if (url && (url.endsWith(".pdf") || url.startsWith("file://"))) {
    // Open the new tab with the content of index.html
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html")
    }, (newTab) => {
      // Pass the PDF URL to the new tab (if necessary)
      chrome.tabs.executeScript(newTab.id, {
        code: `window.PDF_URL = "${url}";`
      });
    });
  } else {
    alert("No PDF found in the current tab");
  }
});
