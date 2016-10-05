$(document).ready(function() {
  chrome.storage.local.get({
    readClient: {
      fontSize: 14,
      wpm: 200
    }
  }, function(data) {
    $("#setting_fontSize_current").html(data.readClient.fontSize);
    $("#setting_custom_wpm").val(data.readClient.wpm);
  });
});

function saveSettings() {
  var readClient_fontSize = parseInt($("#setting_fontSize_current").html());
  var readClient_wpm = parseInt($("#setting_custom_wpm").val());
  chrome.storage.local.set({
    readClient: {
      fontSize: readClient_fontSize,
      wpm: readClient_wpm
    }
  }, function() {
    console.log("Settings saved!");
  });
}

// Various Options Changed Events

$("#setting_fontSize li").on("click", function() {
  $("#setting_fontSize_current").text($(this).text().slice(0, -2));
  saveSettings();
});

$("#setting_custom_wpm").donetyping(function() {
  saveSettings();
});