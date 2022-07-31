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
      
        row += `<td><button type="button" id="${shuttle._id.device}" onclick="editShuttle(this)"  data-toggle="modal" data-target="#addShutteModal" class="btn btn-outline-primary mb-1 mr-1"><i class="fas fa-edit"></i></button><button type="button" id="${shuttle._id.device}" onclick="confirmDelete(this)" class="btn btn-outline-danger mb-1 mr-1"><i class="fas fa-trash"></i></button>`;

        row += "</tr>"

    });
    $("#table").append(row);

}