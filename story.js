// https://developer.chrome.com/apps/storage
// https://developer.chrome.com/apps/storage#property-local
// Story strage:
/*
readClient: {
  fontSize: 12
},
stories: [
  {
    "id": 123123
    "title": "TITLE GOES HERE"
    "etc": "All the results from StoryDetails"
    www.foxinflame.tk/documentation/WattPad/#response_ind-story
    "content": "<html formatted and escaped>"
  },
  {
    
  }
],
readPosition: {
  123123: 123415
  storyId: chapterId
}



Reading Speed Calculating References:
- Average characters per word: 7.60 or 4.79 (http://norvig.com/mayzner.html)
- Average reading speed: 200 wpm (https://en.wikipedia.org/wiki/Speed_reading)
*/

// [+] ================================================== [+]
// [+] ------------------VARIABLES----------------------- [+]
// [+] ================================================== [+]
var sync_wpm;
var sync_stories;
var search_posx;
var detailedInformation_id;



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
    sync_readPosition = data.readPosition;
    if(callback) {
      callback(data);
    }
  });
}

// [+] ================================================== [+]
// [+] ---------------------EVENTS----------------------- [+]
// [+] ================================================== [+]

//   [+] ===================CONTAINS======================= [+]
String.prototype.contains = function(string) {
  return (this.indexOf(string) != -1);
};

//   [+] ===================REPLACEALL===================== [+]
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//   [+] ===============GETPARAMETERBYURL================== [+]
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//   [+] ====================READTIME====================== [+]
function readTime(characterCount, format) {
  est_wordCount = parseInt(characterCount) / 6.195;
  est_wordCount = Math.round(est_wordCount);
  est_minutes = est_wordCount / sync_wpm;
  est_minutes = Math.round(est_minutes);
  if(!format) {
    return est_minutes.toString();
  }
  if(est_minutes == 1) {
    suffix = " minute";
  } else {
    suffix = " minutes";
  }
  if(est_minutes > 60) {
    est_hours = est_minutes / 60;
    est_hours = Math.round(est_hours);
    if(est_hours == 1) {
      suffix = " hour";
    } else {
      suffix = " hours";
    }
    return est_hours.toString() + suffix;
  } else {
    return est_minutes.toString() + suffix;
  }
}



// [+] ================================================== [+]
// [+] ------------------MAIN CODE----------------------- [+]
// [+] ================================================== [+]

//   [+] ====================APPBAR======================== [+]
$("#appbar-back").on("click", function() {
  $("#search").css("margin-left", "0").show();
  $("#storyDetails").css("margin-left", "360px").hide();
  $("#appbar-back").hide(function() {
    $("#appbar-downloads").css("display", "block");
  });
  $("body").scrollTop(search_posx); // This comes after because #search isn't visible before
});
$("#appbar-downloads").on("click", function() {
  chrome.app.window.create("downloads.html", {
    id: "downloads",
    outerBounds: {
      width: 400,
      height: 560
    },
    alwaysOnTop: false,
    resizable: false,
    frame: {
      type: "chrome",
      color: "#e69000"
    }
  });
});
$("#mainMenu_openSettings").on("click", function() {
  chrome.app.window.create("settings/settings.html", {
    id: "settings",
    outerBounds: {
      width: 480,
      height: 560
    },
    alwaysOnTop: false,
    resizable: false,
    frame: {
      type: 'chrome',
      color: '#e69000'
    }
  });
});

//   [+] ====================SEARCH======================== [+]
$("#searchStory_input").donetyping(function() {
  getStorage(function(data) {
    console.log(data);
  });
  if(navigator.onLine) {
    var url;
    if($.trim($("#searchStory_input").val()) !== "") {
      $("#searchStory_status").text("Searching Online...");
      url = "http://www.foxinflame.tk/stories/api/search.php?limit=30&query=" + $("#searchStory_input").val().replaceAll(" ", "%2B");
      $.ajax({
        url: url,
        type: "GET",
        success: function(data, textStatus, jqXHR) {
          console.log("Query to: http://www.foxinflame.tk/stories/api/search.php?query=" + $("#searchStory_input").val().replaceAll(" ", "%2B"));
          formatSearchResults("online", $.parseJSON(data));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.responseText);
          console.log(textStatus);
          console.log(errorThrown);
        },
        cache: true
      });
    } else {
      $("#searchStory_status").text("");
      $("#searchResults").html("");
    }
  } else {
    if($.trim($("#searchStory_input").val()) !== "") {
      $("#searchStory_status").text("Searching Locally...");
      getStorage(function() {
        var searchResult_Array = [];
        for(var i=0;i<sync_stories.length;i++) {
          if(sync_stories[i].title.toLowerCase().indexOf($("#searchStory_input").val().toLowerCase()) !== -1) {
            searchResult_Array.push(sync_stories[i]);
          } else if(sync_stories[i].user.name.toLowerCase().indexOf($("#searchStory_input").val().toLowerCase()) !== -1) {
            searchResult_Array.push(sync_stories[i]);
          } else if(sync_stories[i].description.toLowerCase().indexOf($("#searchStory_input").val().toLowerCase()) !== -1) {
            searchResult_Array.push(sync_stories[i]);
          }
        }
        formatSearchResults("offline", searchResult_Array);
      });
    } else {
      $("#searchStory_statue").text("");
      $("#searchResults").html("");
    }
  }
});

function formatSearchResults(type, data, offset) {
  if(!type) {
    console.error("Type or Data could not be read.");
    return;
  }
  if(type == "offline") {
    $("#searchStory_status").text(data.length + " stories found.");
    $("#searchResults").html("");
    data.forEach(function(index, i) {
      $("#searchResults").append(
        "<div class=\"searchResult\" data-id=\"" + index.id + "\">" +
          "<div class=\"searchResult-cover\">" +
            "<img id=\"searchResult-cover-" + i + "\" src=\"images/OfflineCover.png\">" +
          "</div>" +
          "<div class=\"searchResult-information\">" +
            "<span class=\"searchResult-title\">" + index.title + "</span>" +
            "<span class=\"searchResult-author\">" + index.user.name + "</span>" +
            "<div class=\"meta\">" +
              "<span><i class=\"material-icons\">mode_comment</i><span class=\"searchResult-comments\">" + index.commentCount + " comments</span></span>" +
              "<span><i class=\"material-icons\">visibility</i><span class=\"searchResult-views\">" + index.readCount + " views</span></span>" +
              "<span><i class=\"material-icons\">access_time</i><span class=\"searchResult-readingTime\">" + readTime(index["length"], "format") + "</span></span>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    });
    initClick();
  }
  if(type == "online_more") {
    $("#searchStory_status").text(data.total + " stories found. Displaying " + (data.stories.length + parseInt(offset)).toString() + ".");
    data.stories.forEach(function(index, i) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.open('GET', index.cover, true);
      var imageUrl;
      xhr.onload = function(e) {
        var urlCreator = window.URL || window.webkitURL;
        imageUrl = urlCreator.createObjectURL(this.response);
        $("#searchResult-cover-" + (parseInt(offset) + i).toString()).attr("src", imageUrl);
      };
      xhr.send();
      $("#searchResults").append(
        "<div class=\"searchResult\" data-id=\"" + index.id + "\">" +
          "<div class=\"searchResult-cover\">" +
            "<img id=\"searchResult-cover-" + (parseInt(offset) + i).toString() + "\" src=\"#\">" +
          "</div>" +
          "<div class=\"searchResult-information\">" +
            "<span class=\"searchResult-title\">" + index.title + "</span>" +
            "<span class=\"searchResult-author\">" + index.user.name + "</span>" +
            "<div class=\"meta\">" +
              "<span><i class=\"material-icons\">mode_comment</i><span class=\"searchResult-comments\">" + index.commentCount + " comments</span></span>" +
              "<span><i class=\"material-icons\">visibility</i><span class=\"searchResult-views\">" + index.readCount + " views</span></span>" +
              "<span><i class=\"material-icons\">access_time</i><span class=\"searchResult-readingTime\">" + readTime(index["length"], "format") + "</span></span>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    });
    initClick();
    if(data.total > (data.stories.length + parseInt(offset))) {
      searchshowMoreButton(parseInt(offset) + data.stories.length);
    }
    console.info(data.stories.length.toString() + " results loaded, and " + data.total + " stories total.");
  }
  if(type == "online") {
    $("#searchStory_status").text(data.total + " stories found. Displaying " + data.stories.length.toString() + ".");
    $("#searchResults").html("");
    data.stories.forEach(function(index, i) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.open('GET', index.cover, true);
      var imageUrl;
      xhr.onload = function(e) {
        var urlCreator = window.URL || window.webkitURL;
        imageUrl = urlCreator.createObjectURL(this.response);
        $("#searchResult-cover-" + i).attr("src", imageUrl);
      };
      xhr.send();
      $("#searchResults").append(
        "<div class=\"searchResult\" data-id=\"" + index.id + "\">" +
          "<div class=\"searchResult-cover\">" +
            "<img id=\"searchResult-cover-" + i + "\" src=\"#\">" +
          "</div>" +
          "<div class=\"searchResult-information\">" +
            "<span class=\"searchResult-title\">" + index.title + "</span>" +
            "<span class=\"searchResult-author\">" + index.user.name + "</span>" +
            "<div class=\"meta\">" +
              "<span><i class=\"material-icons\">mode_comment</i><span class=\"searchResult-comments\">" + index.commentCount + " comments</span></span>" +
              "<span><i class=\"material-icons\">visibility</i><span class=\"searchResult-views\">" + index.readCount + " views</span></span>" +
              "<span><i class=\"material-icons\">access_time</i><span class=\"searchResult-readingTime\">" + readTime(index["length"], "format") + "</span></span>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    });
    initClick();
    if(data.total > (data.stories.length + parseInt(getParameterByName("offset", data.nextUrl)))) {
      searchshowMoreButton(getParameterByName("offset", data.nextUrl));
    }
    console.info(data.stories.length.toString() + " results loaded, and " + data.total + " stories total.");
  }
}

function searchshowMoreButton(offset) {
  offset = offset.toString();
  $("#searchResults").append(
    "<div class=\"searchResult\" id=\"search_loadMore\">" +
      "Load More" +
    "</div>"
  );
  $("#search_loadMore").on("click", function() {
    $("#search_loadMore").text("Loading...");
    $.ajax({
      url: "http://www.foxinflame.tk/stories/api/search.php?limit=30&offset=" + offset + "&query=" + $("#searchStory_input").val().replaceAll(" ", "%2B"),
      type: "GET",
      success: function(data, textStatus, jqXHR) {
        $("#search_loadMore").remove();
        formatSearchResults("online_more", $.parseJSON(data), offset);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
      cache: true
    });
  });
}





function initClick() {
  $("#searchResults .searchResult").on("click", function() {
    search_posx = parseInt($("body").scrollTop());
    $("body").scrollTop(0);
    detailedInformation($(this).data("id"));
  });
}

function detailedInformation(id) {
  detailedInformation_id = id;
  $("#search").css("margin-left", "-360px").hide();
  $("#storyDetails").css("margin-left", "0").show();
  $("#appbar-downloads").hide(function() {
    $("#appbar-back").css("display", "block");
  });
  $("#download_all_parts i").text("cached");
  getStorage(function() {
    $("#download_all_parts i").text("file_download");
    for(var i=0;i<sync_stories.length;i++) {
      if(sync_stories[i].id == id) {
        $("#information .action-button .floating-button").css("background", "#00a000");
        $("#download_all_parts i").text("check");
        break; // Required to break out of loop
      } else {
        $("#information .action-button .floating-button").css("background", "#00b2b2");
        $("#download_all_parts i").text("file_download");
      }
    }
    if(navigator.onLine) {
      $.ajax({
        url: "https://www.wattpad.com/api/v3/stories/" + id,
        type: "GET",
        success: function(data) {
          if(sync_readPosition[id]) {
            displayData(data, sync_readPosition[id])
          } else {
            displayData(data);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    } else {
      for(var i=0;i<sync_stories.length;i++) {
        if(sync_stories[i].id == id) {
          displayData(sync_stories[i]);
          break;
        }
      }
    }
  });
}

function displayData(data, chapter) {
  function searchForId(chapterId) {
    var indexchap;
    data.parts.forEach(function(index, i) {
      if(index.id == chapterId) {
        indexchap = i;
      }
    });
    return indexchap;
  }
  var xhr = new XMLHttpRequest();
  var imgSrc;
  xhr.open('GET', data.cover, true);
  xhr.responseType = 'blob';
  xhr.onload = function(e) {
    $(".cover img").attr("src", window.URL.createObjectURL(this.response));
  };
  xhr.send();
  $(".story--description p").html(data.description);
  $(".story--author span").html(data.user.name);
  $(".story--title span").html(data.title);
  $(".story--vote-count").html(data.voteCount);
  $(".story--read-count").html(data.readCount);
  $(".story--comment-count").html(data.commentCount);
  $(".story--numparts").html(data.numParts);
  var maturity = (data.mature) ? "Mature" : "Not Mature";
  $(".story--maturity").html(maturity);
  $(".story--language").html(data.language.name);
  data.user.fullname = data.user.fullname || "N/A";
  $(".story--fullname").html(data.user.fullname);
  $.ajax({
    url: "http://www.foxinflame.tk/stories/api/getcategories.php",
    type: "GET",
    success: function(dataCategories) {
      dataCategories = $.parseJSON(dataCategories.match("{(.*)}")[0]);
      $(".story--category").html(dataCategories[data.categories[0]]);
    },
    error: function(jqXHR, textStatus, thrownError) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(thrownError);
    }
  })
  $(".parts-card--parts").html("");
  var count = 0;
  data.parts.reverse();
  if(chapter) array_count = searchForId(chapter);
  data.parts.forEach(function(index) {
    if(!chapter) {
      if(count < 5) {
        $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
      } else {
        $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
      }
    } else {
      if(count < (array_count + 3) && count > (array_count - 3)) {
        if(count == array_count){
          $("<li class=\"active\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
        } else {
          $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
        }
      } else {
        $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
      }
    }
    count++;
  });
  if(!chapter) {
    if(count < 5) {
      $(".parts-card a.allparts-wrapper").hide();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "8px");
    } else {
      $(".parts-card a.allparts-wrapper").show();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "48px");
    }
  } else {
    if(count <= ($(".parts-card--parts li:not(.hide)").length)) {
      $(".parts-card a.allparts-wrapper").hide();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "8px");
    } else {
      $(".parts-card a.allparts-wrapper").show();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "48px");
    }
  }
  li_click_init();
  $("#parts-card--order").click(function() {
    count = 0;
    data.parts.reverse();
    array_count = null;
    if(chapter) array_count = searchForId(chapter);
    if($(this).text() == "keyboard_arrow_up") {
      $(this).html("keyboard_arrow_down");
    } else {
      $(this).html("keyboard_arrow_up");
    }
    $(".parts-card--parts").html("");
    count = 0;
    data.parts.forEach(function(index) {
      if(!chapter) {
        if(count < 5) {
          $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>" ).appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
        } else {
          $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
        }
      } else {
        if(count < (array_count + 3) && count > (array_count - 3)) {
          if(count == array_count){
            $("<li class=\"active\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
          } else {
            $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
          }
        } else {
          $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts");
        }
      }
      count++;
    });
    if(count < 5) {
      $(".parts-card a.allparts-wrapper").hide();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "8px");
    } else {
      $(".parts-card a.allparts-wrapper").show();
      $(".parts-card button.allparts").html("All Parts");
      $(".parts-card").css("padding-bottom", "48px");
    }
    li_click_init();
  });
}

$(".parts-card a.allparts-wrapper").click(function() {
  if($(".parts-card button.allparts").text() == "Collapse") {
    $(".parts-card--parts li.hide").slideUp(1000);
    $(".parts-card button.allparts").html("All Parts");
  } else {
    $(".parts-card--parts li.hide").fadeIn(1500);
    $(".parts-card button.allparts").html("Collapse");
  }
  return false;
});

function li_click_init() {
  $(".parts-card--parts li").click(function() {
    chrome.app.window.create("readClient/read.html?partID=" + $(this).data("part-id"), {
      id: "read-" + $(this).data("part-id"),
      outerBounds: {
        width: 480,
        height: 480
      },
      alwaysOnTop: true,
      resizable: true,
      frame: "none"
    });
  });
}

$("#download_all_parts").hover(function() {
  if($("#download_all_parts i").text() == "check") {
    $("#download_all_parts i").text("delete");
    $("#information .action-button .floating-button").css("background", "#ff2000");
  }
}, function() {
  if($("#download_all_parts i").text() == "delete") {
    $("#download_all_parts i").text("check");
    $("#information .action-button .floating-button").css("background", "#00a000");
  }
});

$("#download_all_parts").on("click", function() {
  if($("#download_all_parts i").text() == "file_download") {
    download_all_chapters(detailedInformation_id, function(status, message) {
      console.log(status);
      if(status == "success") {
        $("#information .action-button .floating-button").css("background", "#00a000");
        $("#download_all_parts i").text("check");
      } else if(status == "error") {
        console.error(message);
      }
    });
  } else if($("#download_all_parts i").text() == "delete") {
    deleteStory(detailedInformation_id);
  }
  function deleteStory(id) {
    chrome.notifications.create("delete-" + id.toString(), {
      type: "progress",
      iconUrl: "images/ic_delete_black_48dp_2x.png",
      title: "Removing...",
      progress: 0,
      message: "Removing story " + id.toString() + " from local storage..."
    });
    getStorage(function() {
      sync_stories.forEach(function(index, i) {
        if(index.id == id.toString()) {
          sync_stories.splice(i, 1);
          chrome.notifications.update("delete-" + id.toString(), {
            progress: 50
          });
        }
      });
      chrome.storage.local.set({
        stories: sync_stories
      }, function() {
        chrome.notifications.update("delete-" + id.toString(), {
          progress: 100
        });
        chrome.notifications.create("deleteSuccess-" + id.toString(), {
          iconUrl: "/images/Checkmark-256.png",
          type: "basic",
          title: "Removed",
          message: "Story " + id.toString() + " has been removed from local storage!"
        }, function() {
          chrome.notifications.clear("delete-" + id.toString());
          window.setTimeout(function() {
            chrome.notifications.clear("deleteSuccess-" + id.toString());
          }, 3000);
        });
        $("#information .action-button .floating-button").css("background", "#00b2b2");
        $("#download_all_parts i").text("file_download");
      });
    });
  }
});
function download_all_chapters(id, callback) {
  chrome.notifications.create("storyDownload-" + id.toString(), {
    type: "progress",
    iconUrl: $("#information .cover img").attr("src"),
    title: "Downloading...",
    progress: 0,
    message: "Downloading story " + id.toString() + " for offline reading..."
  });
  var contains = false;
  var storyDetails;
  getStorage(function() {
    sync_stories.forEach(function(index) {
      if(index.id == id) {
        callback("error", "Already Downloaded");
        contains = true;
        return;
      }
    });
    if(contains === false) {
      $.ajax({
        url: "https://www.wattpad.com/api/v3/stories/" + id,
        type: "GET",
        success: function(data) {
          storyDetails = data;
          getContents();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    }
  });
  function getContents() {
    length = storyDetails.parts.length;
    count = 0;
    wait();
    total = storyDetails.parts.length;
    storyDetails.parts.forEach(function(index, i) {
      chrome.notifications.update("storyDownload-" + id.toString(), {
        progress: Math.floor(((i + 1) / total) * 100)
      });
      $.ajax({
        url: "https://www.wattpad.com/apiv2/storytext?id=" + index.id,
        type: "GET",
        success: function(data) {
          var compressed = LZString.compressToUTF16(data);
          storyDetails.parts[i].content = compressed;
          count++;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          console.log(textStatus);
          console.log(errorThrown);
        }
      });
    });
    function wait() {
      if(length > count) {
        setTimeout(wait, 50);
      } else {
        push();
      }
    }
    function push() {
      sync_stories.push(storyDetails);
      chrome.storage.local.set({
        stories: sync_stories
      }, function() {
        chrome.notifications.clear("storyDownload-" + id.toString(), function() {
          chrome.notifications.create("success-" + id.toString(), {
            iconUrl: "/images/Checkmark-256.png",
            type: "basic",
            title: "Download Completed",
            message: "Download of story " + id.toString() + " has been completed!"
          }, function() {
            window.setTimeout(function() {
              chrome.notifications.clear("success-" + id.toString());
            }, 3000);
          });
          callback("success", "Download Completed!");
        })
      });
    }
  }
}


// [+] ================================================== [+]
// [+] -------------------MESSAGES----------------------- [+]
// [+] ================================================== [+]

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.detailedInformation) {
    detailedInformation(request.detailedInformation);
    sendResponse({
      status: "opened"
    });
  }
  if(request.getNextPrevious) {
    
  }
});