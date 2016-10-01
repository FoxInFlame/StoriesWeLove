navigator.webkitPersistentStorage.queryUsageAndQuota(
  function(usedBytes, grantedBytes) {
    console.log("We are using", usedBytes, " of ", grantedBytes, " bytes");
  },
  function(e) {
    console.log("Error", e);
  }
);


var launchStoriesWeLove = function () {
  chrome.app.window.create('story.html?storyID=14197693', {
    outerBounds: {
      width: 360,
      height: 640
    },
    //alwaysOnTop: true,
    resizable: false,
    frame: {
      type: 'chrome',
      color: '#e69000'
    }
  });
};

var onNotificationsClicked = function(id) {
  // Only launch if no other windows exist.
  var windows = chrome.app.window.getAll();
  if (windows && windows.length === 0) {
    chrome.notifications.clear(id, function() {}); // Callback required.
    launchStoriesWeLove();
  }
};
chrome.app.runtime.onLaunched.addListener(launchStoriesWeLove);
chrome.notifications.onClicked.addListener(onNotificationsClicked);
