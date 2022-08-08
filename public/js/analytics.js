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
        <td>${Math.round(shuttle.avg_speed)}</td>
        <td>${shuttle.top_speed}</td>`;
      
        row += `<td><button type="button" id="${shuttle._id.device}" onclick="analyzeShuttle(${shuttle._id.device},${shuttle._id.shuttleNumber})"  class="btn btn-outline-primary mb-1 mr-1"><i class="fas fa-fw fa-chart-area"></i></button>`;

        row += "</tr>"

    });
    $("#table").append(row);

}

function analyzeShuttle(deviceid,shuttlenumber){
  window.location.href = 'analytics/'+deviceid+"/"+shuttlenumber;
}