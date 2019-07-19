// Make a get request to our api route that will return every user
$.get("/api/leaders", function(data) {
  console.log(data);
  renderBestTime(data);
});

function renderBestTime(data) {
  // For each user that our server sends us back

  if (data.length !== 0) {
    $("#bestTIme").empty();
    $("#bestTIme").show();

    for (var i = 0; i < data.length; i++) {
      // Create a parent div to hold  data
      if (data[i].bestTime !== 0) {
        //formating the time with moment.js
        var duration = moment.duration(data[i].bestTime, "milliseconds");
        var formmatedTime = duration.format("m:ss", { trim: false });

        $(".table-dark > tbody").append($("<tr>").append($("<td>").text([i + 1]), $("<td>").text(data[i].name), $("<td>").text(data[i].treasurePoint), $("<td>").text(data[i].monstersKilled), $("<td>").text(formmatedTime)));
      }
    }
  }
}