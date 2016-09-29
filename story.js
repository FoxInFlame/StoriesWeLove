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

var storyID = getParameterByName("storyID");

$.ajax({
  url: "https://www.wattpad.com/api/v3/stories/" + storyID,
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

function toDataUrl(src, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas = document.createElement('CANVAS');
    var ctx = canvas.getContext('2d');
    var dataURL;
    canvas.height = this.height;
    canvas.width = this.width;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}

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
    $(".parts-card").css("padding-bottom", "8px");
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
    data.parts.forEach(function(index) {
      if(count < 5) {
        $("<li data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
      } else {
        console.log($(".parts-card button.allparts").html());
        $("<li class=\"hide\" data-part-id=\"" + index.id + "\"><span></span>" + index.title + "</li>").appendTo(".parts-card--parts"); // Use appendTo if it should be in oldest order
        if($(".parts-card button.allparts").html() == "Collapse") {
          $(".parts-card--parts li.hide").show();
        }
      }
      count++;
    });
    if(count < 5) {
      $(".parts-card a.allparts-wrapper").hide();
      $(".parts-card").css("padding-bottom", "8px");
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