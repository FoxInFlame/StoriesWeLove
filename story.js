// https://developer.chrome.com/apps/storage
// https://developer.chrome.com/apps/storage#property-local
// Story strage:
/*
stories [
  {
    "id": 123123
    "title": "TITLE GOES HERE"
    "etc": "All the results from StoryDetails"
    www.foxinflame.tk/documentation/WattPad/#response_ind-story
    "content": "<html formatted and escaped>"
  },
  {
    
  }
]



Reading Speed Calculating References:
- Average characters per word: 7.60 or 4.79 (http://norvig.com/mayzner.html)
- Average reading speed: 200 wpm (https://en.wikipedia.org/wiki/Speed_reading)
*/

// [+] ===================CONTAINS======================= [+]
String.prototype.contains = function(string) {
  return (this.indexOf(string) != -1);
};

// [+] ===================REPLACEALL===================== [+]
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


// [+] ==================DONE TYPING===================== [+]
;(function($){
    $.fn.extend({
        donetyping: function(callback,timeout){
            timeout = timeout || 1e3; // 1 second default timeout
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress paste',function(e){
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too preemptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type=='keyup' && e.keyCode!=8) return;
                    
                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur',function(){
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });
})(jQuery);

// [+] ===============GETPARAMETERBYURL================== [+]
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// [+] ====================READTIME====================== [+]
function readTime(characterCount, format) {
  est_wordCount = parseInt(characterCount) / 6.195;
  est_wordCount = Math.round(est_wordCount);
  est_minutes = est_wordCount / 200;
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


$("#searchStory_input").donetyping(function() {
  if(navigator.onLine) {
    var url;
    if($.trim($("#searchStory_input").val()) !== "") {
      $("#searchStory_status").text("Searching Online...");
      url = "http://www.foxinflame.tk/stories/api/search.php?limit=30&query=" + $("#searchStory_input").val().replaceAll(" ", "%2B");
      $.ajax({
        url: url,
        type: "GET",
        timeout: 10000,
        success: function(data, textStatus, jqXHR) {
          console.log("Query to: http://www.foxinflame.tk/stories/api/search.php?query=" + $("#searchStory_input").val().replaceAll(" ", "%2B"));
          console.log(textStatus);
          console.log(jqXHR);
          console.log($.parseJSON(data));
          formatSearchResults("online", $.parseJSON(data));
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
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
    $("#searchStory_status").text("Searching Locally...");
  }
});

function formatSearchResults(type, data) {
  if(!type || !data) {
    console.error("Type or Data could not be read.");
    return;
  }
  if(type == "offline") {
    
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
    console.info(data.stories.length.toString() + " results loaded, and " + data.total + " stories total.");
  }
}







function initClick() {
  $("#searchResults .searchResult .searchResult-cover").on("click", function() {
    detailedInformation($(this).parent().data("id"));
  });
}

function detailedInformation(id) {
  $("#search").css("margin-left", "-360px").hide();
  $("#storyDetails").css("margin-left", "0").show();
  $("#appbar-downloads").hide(function() {
    $("#appbar-back").css("display", "block");
  });
  $.ajax({
    url: "https://www.wattpad.com/api/v3/stories/" + id,
    type: "GET",
    success: function(data) {
      console.log(data);
      displayData(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
  });
}

$("#appbar-back").on("click", function() {
  $("#search").css("margin-left", "0").show();
  $("#storyDetails").css("margin-left", "360px").hide();
  $("#appbar-back").hide(function() {
    $("#appbar-downloads").css("display", "block");
  });
});

function displayData(data) {
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
  $(".parts-card--parts").html("");
  var count = 0;
  data.parts.reverse();
  data.parts.forEach(function(index) {
    if(count < 5) {
      $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
    } else {
      $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
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
  $("#parts-card--order").click(function() {
    count = 0;
    data.parts.reverse();
    if($(this).html() == "keyboard_arrow_up") {
      $(this).html("keyboard_arrow_down");
    } else {
      $(this).html("keyboard_arrow_up");
    }
    $(".parts-card--parts").html("");
    count = 0;
    data.parts.forEach(function(index) {
      if(count < 5) {
        $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
      } else {
        $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
        if($(".parts-card button.allparts").html() == "Collapse") {
          $(".parts-card--parts li.hide").show();
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
    console.log("it's hidden now");
    $(".parts-card--parts li.hide").slideUp(1000);
    $(".parts-card button.allparts").html("All Parts");
  } else {
    console.log("it's shown now");
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