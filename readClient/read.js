$("#read_close").click(function() {
  window.close();
});


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

$.ajax({
  url: "https://www.wattpad.com/apiv2/storytext?id=" + getParameterByName("partID"),
  type: "GET",
  success: function(data) {
    $("#main").html(data);
    getNextPrevious(getParameterByName("partID"));
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
  }
});


var currentStory;
var previousStory;
var nextStory;

function getNextPrevious(id) {
  $.ajax({
    url: "https://www.wattpad.com/apiv2/info?id=" + id,
    type: "GET",
    success: function(data) {
      console.log(data);
      $("#read_title").html(data.title);
      groupsArray = data.group;
      groupsArray.forEach(function(index, i) {
        if(index.ID == id) {
          console.log(index);
          currentStory = index;
          previousStory = groupsArray[i - 1];
          nextStory = groupsArray[i + 1];
          $("#read_previous").click(function() {
            chrome.app.window.create("readClient/read.html?partID=" + previousStory.ID, {
              id: "read-" + previousStory.ID,
              outerBounds: {
              width: 480,
              height: 480
              },
              alwaysOnTop: true,
              resizable: true,
              frame: "none"
            });
            window.close();
          });
          $("#read_next").click(function() {
            chrome.app.window.create("readClient/read.html?partID=" + nextStory.ID, {
              id: "read-" + nextStory.ID,
              outerBounds: {
              width: 480,
              height: 480
              },
              alwaysOnTop: true,
              resizable: true,
              frame: "none"
            });
            window.close();
          });
          return;
        }
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}