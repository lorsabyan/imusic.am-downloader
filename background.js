chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "StreamSaver.js"});
  chrome.tabs.executeScript(null, {file: "browser-id3-writer.4.0.0.js"});
  chrome.tabs.executeScript(null, {file: "content_script.js"});
});