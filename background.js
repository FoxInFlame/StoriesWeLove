chrome.app.runtime.onLaunched.addListener(function() {
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
});