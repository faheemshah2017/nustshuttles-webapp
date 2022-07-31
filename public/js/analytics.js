allShuttlesSum.sort((a, b) =>
  a._id.shuttleNumber.localeCompare(b._id.shuttleNumber)
);

setShuttlesTable(allShuttlesSum);

function setShuttlesTable(shuttles) {
    $("#table").html("");
    let row = "";

    shuttles.forEach((shuttle, i) => {

        row += `<tr><td>${shuttle._id.device}</td>
        <td>${shuttle._id.shuttleNumber}</td>
        <td>${shuttle.avg_speed}</td>
        <td>${shuttle.top_speed}</td>`;
      
        row += `<td><button type="button" id="${shuttle._id.device}" onclick="analyzeShuttle(this)"  class="btn btn-outline-primary mb-1 mr-1"><i class="fas fa-bus"></i></button>`;

        row += "</tr>"

    });
    $("#table").append(row);

}

function analyzeShuttle(e){
  console.log(e.id)
  window.location.href = 'analytics/'+e.id;
}