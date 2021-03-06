// [+] ================================================== [+]
// [+] ------------------VARIABLES----------------------- [+]
// [+] ================================================== [+]
var sync_fontSize;
var sync_stories;



function getStorage(callback) {
  chrome.storage.local.get({
    readClient: {
      fontSize: 12,
      //wpm: 200
    },
    stories: [],
    readPosition: {}
  }, function(data) {
    sync_fontSize = data.readClient.fontSize;
    sync_stories = data.stories;
    if(callback) {
      callback(data);
    }
  });
}

getStorage(function(data) {
  $("#main").css("font-size", sync_fontSize + "px");
});

$("#read_close").click(function() {
  window.close();
});

function updateReadPosition(id) {
  var storyId;
  $.ajax({
    url: "https://www.wattpad.com/apiv2/info?id=" + id,
    type: "GET",
    success: function(data) {
      storyId = data.groupId;
      setReadPositionStorage();
    },
    error: function(jqXHR, textStatus, thrownError) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(thrownError);
    }
  });
  function setReadPositionStorage() {
    var readPosition;
    getStorage(function(data) {
      readPosition = data.readPosition;
      readPosition[storyId] = id;
      chrome.storage.local.set({
        readPosition: readPosition
      });
    });
  }
}

String.prototype.contains = function(string) {
  return (this.indexOf(string) != -1);
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

if(navigator.onLine) {
  $.ajax({
    url: "https://www.wattpad.com/apiv2/storytext?id=" + getParameterByName("partID"),
    type: "GET",
    success: function(data) {
      $("#main").html(data);
      getNextPrevious(getParameterByName("partID"));
      updateReadPosition(getParameterByName("partID"));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
    cache: false
  });
} else {
  getStorage(function() {
    $("#main").html("This story isn't downloaded for offline reading.");
loop1:
    for(var i=0;i<sync_stories.length;i++) {
loop2:
      for(var x=0;x<sync_stories[i].parts.length;x++) {
        if(sync_stories[i].parts[x].id == getParameterByName("partID")) {
          $("#main").html(LZString.decompressFromUTF16(sync_stories[i].parts[x].content));
          getNextPreviousOffline(getParameterByName("partID"));
          break loop1;
        }
      }
    }
  });
}


var currentStory;
var previousStory;
var nextStory;

function getNextPreviousOffline(id) {
  for(var i=0;i<sync_stories.length;i++) {
    for(var x=0;x<sync_stories[i].parts.length;x++) {
      if(sync_stories[i].parts[x].id == getParameterByName("partID")) {
        currentStory = sync_stories[i].parts[x];
        previousStory = sync_stories[i].parts[x - 1];
        nextStory = sync_stories[i].parts[x + 1];
        if(!previousStory) {
          $("#read_previous").addClass("disabled").css("pointer-events", "none");
        }
        if(!nextStory) {
          $("#read_next").addClass("disabled").css("pointer-events", "none");
        }
        $("#read_previous").click(function() {
          chrome.app.window.create("readClient/read.html?partID=" + previousStory.id.toString(), {
            id: "read-" + previousStory.id.toString(),
            outerBounds: {
              width: 480,
              height: 480
            },
            alwaysOnTop: true,
            resizable: true,
            frame: "none"
          }, function() {
            window.close();
          });
        });
        $("#read_next").click(function() {
          chrome.app.window.create("readClient/read.html?partID=" + nextStory.id.toString(), {
            id: "read-" + nextStory.id.toString(),
            outerBounds: {
              width: 480,
              height: 480
            },
            alwaysOnTop: true,
            resizable: true,
            frame: "none"
          }, function() {
            window.close();
          });
        });
        return;
      }
    }
  }
}

function getNextPrevious(id) {
  $.ajax({
    url: "https://www.wattpad.com/apiv2/info?id=" + id,
    type: "GET",
    success: function(data) {
      $("#read_title").html(data.title);
      groupsArray = data.group;
      groupsArray.forEach(function(index, i) {
        if(index.ID == id) {
          currentStory = index;
          previousStory = groupsArray[i - 1];
          nextStory = groupsArray[i + 1];
          if(!previousStory) {
            $("#read_previous").addClass("disabled").css("pointer-events", "none");
          }
          if(!nextStory) {
            $("#read_next").addClass("disabled").css("pointer-events", "none");
          }
          $("#read_previous").click(function() {
            chrome.app.window.create("readClient/read.html?partID=" + previousStory.ID.toString(), {
              id: "read-" + previousStory.ID.toString(),
              outerBounds: {
                width: 480,
                height: 480
              },
              alwaysOnTop: true,
              resizable: true,
              frame: "none"
            }, function() {
              window.close();
            });
          });
          $("#read_next").click(function() {
            chrome.app.window.create("readClient/read.html?partID=" + nextStory.ID.toString(), {
              id: "read-" + nextStory.ID.toString(),
              outerBounds: {
                width: 480,
                height: 480
              },
              alwaysOnTop: true,
              resizable: true,
              frame: "none"
            }, function() {
              window.close();
            });
          });
          return;
        }
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
    cache: false
  });
}