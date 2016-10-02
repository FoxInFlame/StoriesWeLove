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





$.fn.dropdown = function (options) {
    var defaults = {
      inDuration: 300,
      outDuration: 225,
      constrain_width: true, // Constrains width of dropdown to the activator
      hover: false,
      gutter: 0, // Spacing from edge
      belowOrigin: false,
      alignment: 'left',
      stopPropagation: false
    };

    // Open dropdown.
    if (options === "open") {
      this.each(function() {
        $(this).trigger('open');
      });
      return false;
    }

    // Close dropdown.
    if (options === "close") {
      this.each(function() {
        $(this).trigger('close');
      });
      return false;
    }

    this.each(function(){
      var origin = $(this);
      var options = $.extend({}, defaults, options);
      var isFocused = false;

      // Dropdown menu
      var activates = $("#"+ origin.attr('data-activates'));

      function updateOptions() {
        if (origin.data('induration') !== undefined)
          options.inDuration = origin.data('induration');
        if (origin.data('outduration') !== undefined)
          options.outDuration = origin.data('outduration');
        if (origin.data('constrainwidth') !== undefined)
          options.constrain_width = origin.data('constrainwidth');
        if (origin.data('hover') !== undefined)
          options.hover = origin.data('hover');
        if (origin.data('gutter') !== undefined)
          options.gutter = origin.data('gutter');
        if (origin.data('beloworigin') !== undefined)
          options.belowOrigin = origin.data('beloworigin');
        if (origin.data('alignment') !== undefined)
          options.alignment = origin.data('alignment');
        if (origin.data('stoppropagation') !== undefined)
          options.stopPropagation = origin.data('stoppropagation');
      }

      updateOptions();

      // Attach dropdown to its activator
      origin.after(activates);

      /*
        Helper function to position and resize dropdown.
        Used in hover and click handler.
      */
      function placeDropdown(eventType) {
        // Check for simultaneous focus and click events.
        if (eventType === 'focus') {
          isFocused = true;
        }

        // Check html data attributes
        updateOptions();

        // Set Dropdown state
        activates.addClass('active');
        origin.addClass('active');

        // Constrain width
        if (options.constrain_width === true) {
          activates.css('width', origin.outerWidth());

        } else {
          activates.css('white-space', 'nowrap');
        }

        // Offscreen detection
        var windowHeight = window.innerHeight;
        var originHeight = origin.innerHeight();
        var offsetLeft = origin.offset().left;
        var offsetTop = origin.offset().top - $(window).scrollTop();
        var currAlignment = options.alignment;
        var gutterSpacing = 0;
        var leftPosition = 0;

        // Below Origin
        var verticalOffset = 0;
        if (options.belowOrigin === true) {
          verticalOffset = originHeight;
        }

        // Check for scrolling positioned container.
        var scrollYOffset = 0;
        var scrollXOffset = 0;
        var wrapper = origin.parent();
        if (!wrapper.is('body')) {
          if (wrapper[0].scrollHeight > wrapper[0].clientHeight) {
            scrollYOffset = wrapper[0].scrollTop;
          }
          if (wrapper[0].scrollWidth > wrapper[0].clientWidth) {
            scrollXOffset = wrapper[0].scrollLeft;
          }
        }


        if (offsetLeft + activates.innerWidth() > $(window).width()) {
          // Dropdown goes past screen on right, force right alignment
          currAlignment = 'right';

        } else if (offsetLeft - activates.innerWidth() + origin.innerWidth() < 0) {
          // Dropdown goes past screen on left, force left alignment
          currAlignment = 'left';
        }
        // Vertical bottom offscreen detection
        if (offsetTop + activates.innerHeight() > windowHeight) {
          // If going upwards still goes offscreen, just crop height of dropdown.
          if (offsetTop + originHeight - activates.innerHeight() < 0) {
            var adjustedHeight = windowHeight - offsetTop - verticalOffset;
            activates.css('max-height', adjustedHeight);
          } else {
            // Flow upwards.
            if (!verticalOffset) {
              verticalOffset += originHeight;
            }
            verticalOffset -= activates.innerHeight();
          }
        }

        // Handle edge alignment
        if (currAlignment === 'left') {
          gutterSpacing = options.gutter;
          leftPosition = origin.position().left + gutterSpacing;
        }
        else if (currAlignment === 'right') {
          var offsetRight = origin.position().left + origin.outerWidth() - activates.outerWidth();
          gutterSpacing = -options.gutter;
          leftPosition =  offsetRight + gutterSpacing;
        }

        // Position dropdown
        activates.css({
          position: 'absolute',
          top: origin.position().top + verticalOffset + scrollYOffset,
          left: leftPosition + scrollXOffset
        });


        // Show dropdown
        activates.stop(true, true).css('opacity', 0)
          .slideDown({
            queue: false,
            duration: options.inDuration,
            easing: 'easeOutCubic',
            complete: function() {
              $(this).css('height', '');
            }
          })
          .animate( {opacity: 1}, {queue: false, duration: options.inDuration, easing: 'easeOutSine'});
      }

      function hideDropdown() {
        // Check for simultaneous focus and click events.
        isFocused = false;
        activates.fadeOut(options.outDuration);
        activates.removeClass('active');
        origin.removeClass('active');
        setTimeout(function() { activates.css('max-height', ''); }, options.outDuration);
      }

      // Hover
      if (options.hover) {
        var open = false;
        origin.unbind('click.' + origin.attr('id'));
        // Hover handler to show dropdown
        origin.on('mouseenter', function(e){ // Mouse over
          if (open === false) {
            placeDropdown();
            open = true;
          }
        });
        origin.on('mouseleave', function(e){
          // If hover on origin then to something other than dropdown content, then close
          var toEl = e.toElement || e.relatedTarget; // added browser compatibility for target element
          if(!$(toEl).closest('.dropdown-content').is(activates)) {
            activates.stop(true, true);
            hideDropdown();
            open = false;
          }
        });

        activates.on('mouseleave', function(e){ // Mouse out
          var toEl = e.toElement || e.relatedTarget;
          if(!$(toEl).closest('.dropdown-button').is(origin)) {
            activates.stop(true, true);
            hideDropdown();
            open = false;
          }
        });

        // Click
      } else {
        // Click handler to show dropdown
        origin.unbind('click.' + origin.attr('id'));
        origin.bind('click.'+origin.attr('id'), function(e){
          if (!isFocused) {
            if ( origin[0] == e.currentTarget &&
                 !origin.hasClass('active') &&
                 ($(e.target).closest('.dropdown-content').length === 0)) {
              e.preventDefault(); // Prevents button click from moving window
              if (options.stopPropagation) {
                e.stopPropagation();
              }
              placeDropdown('click');
            }
            // If origin is clicked and menu is open, close menu
            else if (origin.hasClass('active')) {
              hideDropdown();
              $(document).unbind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'));
            }
            // If menu open, add click close handler to document
            if (activates.hasClass('active')) {
              $(document).bind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'), function (e) {
                if (!activates.is(e.target) && !origin.is(e.target) && (!origin.find(e.target).length) ) {
                  hideDropdown();
                  $(document).unbind('click.'+ activates.attr('id') + ' touchstart.' + activates.attr('id'));
                }
              });
            }
          }
        });

      } // End else

      // Listen to open and close event - useful for select component
      origin.on('open', function(e, eventType) {
        placeDropdown(eventType);
      });
      origin.on('close', hideDropdown);


    });
  }; // End dropdown plugin
  
$(".dropdown-button").dropdown({
  inDuration: 300,
  outDuration: 225,
  constrain_width: false, // Does not change width of dropdown to that of the activator
  hover: true, // Activate on hover
  gutter: 0, // Spacing from edge
  belowOrigin: false, // Displays dropdown below the button
  alignment: 'left' // Displays dropdown with edge aligned to the left of button
});

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