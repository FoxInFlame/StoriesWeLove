var sync_stories;

function getStorage(callback) {
  chrome.storage.local.get({
    readClient: {
      //fontSize: 12,
      wpm: 200
    },
    stories: [],
    readPosition: {}
  }, function(data) {
    sync_wpm = data.readClient.wpm;
    sync_stories = data.stories;
    if(callback) {
      callback(data);
    }
  });
}

getStorage(function() {
  function formatBytes(bytes, decimals) {
    if(bytes === 0) return "0 Byte";
    var k = 1000; // or 1024 for binary
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  for(var i=0;i<sync_stories.length;i++) {
    var characterLength = 0;
    for(var x=0;x<sync_stories[i].parts.length;x++) {
      characterLength = characterLength + sync_stories[i].parts[x].content.length;
    }
    var sizeBytes = (characterLength * 15) * 0.125;
    var size = formatBytes(sizeBytes, 1);
    $("#main").append(
      "<div data-id=\"" + sync_stories[i].id + "\" class=\"story story-" + sync_stories[i].id + "\">" +
        "<div class=\"story-img\">" +
          "<img src=\"images/OfflineCover.png\">" +
        "</div>" +
        "<div class=\"story-info\">" +
          "<span class=\"title\">" + sync_stories[i].title + "</span>" +
          "<span class=\"author\">" + sync_stories[i].user.name + "</span>" +
          "<span class=\"size-wrapper\">Size: <span class=\"size\">" + size + "</span></span>" +
        "</div>" +
      "</div>"
    );
  }
  init_click();
});

function init_click() {
  $(".story").on("click", function() {
    chrome.runtime.sendMessage({
      detailedInformation: $(this).attr("data-id")
    }, function(response) {
      window.close();
    });
  });
}