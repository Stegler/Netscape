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
        $("#bestTIme").append("<h4> Name: " + data[i].name + "</h4>");
        $("#bestTIme").append("<h4> Best Time : " + data[i].bestTime / 1000 + "s</h4>");
        $("#bestTIme").append("<h4> Treasure Collected : " + data[i].bestTime + " coins</h4>");
        $("#bestTIme").append("<h4> Treasure Collected : " + data[i].monstersKilled + " coins</h4>");
      }
    }
  }
}
