let map;
var newRoute = [];
var i = 1;
var lastRoute = 0;
var infoWindow;
var addingRoute = false;
const myLatlng = { lat: 33.643418, lng: 72.990158 };
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.643418, lng: 72.990158 },
        zoom: 15,
        restriction: {
            latLngBounds: {
                north: 36,
                south: 24,
                east: 77,
                west: 65,
            },
        }
    }, () => {
        document.getElementById("map").style.height = "800px"
    });

    map.setHeading(90);

    // Pick your pin (hole or no hole)
    var pinSVGHole = "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z";
    var labelOriginHole = new google.maps.Point(12, 15);
    var pinSVGFilled = "M 12,2 C 8.1340068,2 5,5.1340068 5,9 c 0,5.25 7,13 7,13 0,0 7,-7.75 7,-13 0,-3.8659932 -3.134007,-7 -7,-7 z";
    var labelOriginFilled = new google.maps.Point(12, 9);

    fillColor = {
        0: "#66bb6a",
        1: "#fc544b",
        2: "#ffa426"
    }

    images = {
        0: "ok",
        1: "alert",
        2: "fault"
    }

    images2 = {
        0: "offline",
        1: "online",
    }

    strokeColor = {
        0: "#eaecf4",
        1: "#66bb6a"
    }

    map.addListener("rightclick", (mapsMouseEvent) => {
        // Close the current InfoWindow.
        infoWindow.close();

        newRoute.pop()
        let flightPlanCoordinates = newRoute;

        i++;
        flightPath[i] = new google.maps.Polyline({
            path: flightPlanCoordinates,
            geodesic: true,
            strokeColor: "#224879",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });
        try {
            flightPath[lastRoute].setMap(null);
        }
        catch (e) { }
        flightPath[i].setMap(map);
        lastRoute = i
    });

    map.addListener("click", (mapsMouseEvent) => {
        // Close the current InfoWindow.
        infoWindow.close();

        if (addingRoute) {
            newRoute.push(mapsMouseEvent.latLng.toJSON())
            let flightPlanCoordinates = newRoute;

            i++;
            flightPath[i] = new google.maps.Polyline({
                path: flightPlanCoordinates,
                geodesic: true,
                strokeColor: "#224879",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            });
            try {
                flightPath[lastRoute].setMap(null);
            }
            catch (e) { }
            flightPath[i].setMap(map);
            lastRoute = i
        }
    });

    // devices = []
    // const markers = shuttles.map((shuttle, i) => {
    //   if (parseFloat(shuttle.speed) > 5) {
    //     shuttle.status = "active"
    //   }
    //   return new google.maps.Marker({
    //     position: { lat: parseFloat(shuttle.latitude), lng: parseFloat(shuttle.longitude) },
    //     icon: {
    //       url: `/img/${shuttle.status}.png`, // url
    //       scaledSize: new google.maps.Size(50, 50), // scaled size
    //     },
    //     title: "Shuttle# " + shuttle.deviceId
    //   });
    // });
    // new MarkerClusterer(map, markers, {
    //   imagePath:
    //     "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    // });
};
routesList = []
function addRoute(){
    routesList.push({
        id: Date.now(),
        _id:$("#shuttleRoute").val(),
        title:($("#shuttleRoute option:selected").text()).replaceAll(" ",""),
        from:$("#timeFrom").val(),
        to:$("#timeTo").val(),
        path:getRoutePath($("#shuttleRoute").val())
    })
    updateList()
}

function updateList(){
    $("#routesList").html("");
    routesList.forEach(e=>{
        $("#routesList").append(`
        <hr>
        <div class="row">
          <div class="col-md-3 pl-4">`+e.title+`
          </div>
          <div class="col-md-3 pl-4">`+e.from+`
          </div>
          <div class="col-md-3 pl-4">`+e.to+`
          </div>
          <div class="col-md-3">
            <span class="btn btn-outline-danger btn-block" onclick="deleteRoute(`+e.id+`)">Delete</span>
          </div>
        </div>`)
    })
}

function deleteRoute(id){
    routesList = routesList.filter(r=> r.id!=id)
    updateList();
}


function getRouteNumber(routeID){
    return (routes.filter(r=>r._id==routeID))[0].routeNumber
}

function getRoutePath(routeID){
    let path = (routes.filter(r=>r._id==routeID))[0].path
    path.map(p=>p.point="nill");
    return path;
}

function addShuttle() {
    var values = {};
    $.each($('#data_form').serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });
    values.route = routesList;

    $.ajax({
        url: "/shuttles/add",
        data: JSON.stringify(values),
        cache: false,
        processData: false,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataofconfirm) {
            $('#addShutteModal').modal('hide');
            $('.modal-backdrop').remove();

            $('form#data_form').trigger("reset");

            swal({
                type: "success",
                icon: "success",
                title: "New shuttle added",
                showConfirmButton: !1,
                timer: 3000
            }).then(function () {
                $.ajax({
                    url: "/shuttles/get",
                    contentType: 'application/json',
                    type: 'GET',
                    success: function (newShuttles) {
                        shuttles = newShuttles;
                        setShuttlesTable(shuttles);
                    }
                });
            });
        }
    });
}

function updateShuttle() {
    var values = {};
    $.each($('#data_form').serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });
    let id  = values.rowId
    delete values.rowId;
    values.route = routesList;
    $.ajax({
        url: "/shuttles/update/"+id,
        data: JSON.stringify(values),
        cache: false,
        processData: false,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataofconfirm) {
            $('#addShutteModal').modal('hide');
            $('.modal-backdrop').remove();

            $('form#data_form').trigger("reset");

            swal({
                type: "success",
                icon: "success",
                title: "Shuttle Updated",
                showConfirmButton: !1,
                timer: 3000
            }).then(function () {
                $.ajax({
                    url: "/shuttles/get",
                    contentType: 'application/json',
                    type: 'GET',
                    success: function (newShuttles) {
                        shuttles = newShuttles;
                        setShuttlesTable(newShuttles);
                    }
                });
            });
        }
    });
}

function editShuttle(e){
    routesList = [];
    let shuttle = getShuttleById(e.id)
    document.getElementById("rowId").value = shuttle._id
    document.getElementById("deviceId").value = shuttle.deviceId
    document.getElementById("shuttleNumber").value = shuttle.shuttleNumber
    document.getElementById("shuttleRoute").value = shuttle.shuttleRoute
    document.getElementById("addBtn").style.display = 'none'
    document.getElementById("updateBtn").style.display = 'block'
    try{
        routesList = [...shuttle.route]
    }
    catch(e){}
    updateList()
}

function addShuttleClick(){
    routesList = [];
    document.getElementById("rowId").value = ""
    document.getElementById("shuttleNumber").value = ""
    document.getElementById("shuttleRoute").value = ""
    document.getElementById("addBtn").style.display = 'block'
    document.getElementById("updateBtn").style.display = 'none'
}

function getShuttleById(shuttleID){
    return (shuttles.filter(s=>s._id==shuttleID))[0]
}

setShuttlesTable(shuttles);

function setShuttlesTable(shuttles) {
    $("#table").html("");
    let row = "";

    shuttles.forEach((shuttle, i) => {

        row += `<tr><td>${shuttle.deviceId}</td>
        <td>${shuttle.shuttleNumber}</td>`;
      
        row += `<td><button type="button" id="${shuttle._id}" onclick="locateShuttle(this)" class="btn btn-outline-info mb-1 mr-1"><i class="fas fa-search"></i></button></td><td><button type="button" id="${shuttle._id}" onclick="editShuttle(this)"  data-toggle="modal" data-target="#addShutteModal" class="btn btn-outline-primary mb-1 mr-1"><i class="fas fa-edit"></i></button><button type="button" id="${shuttle._id}" onclick="confirmDelete(this)" class="btn btn-outline-danger mb-1 mr-1"><i class="fas fa-trash"></i></button>`;

        row += "</tr>"

    });
    $("#table").append(row);

}

function confirmDelete(shuttle) {
    id = shuttle.id
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: "/shuttles/delete/" + id,
                    cache: false,
                    processData: false,
                    type: 'DELETE',
                    success: function (dataofconfirm) {
                        $.ajax({
                            url: "/shuttles/get",
                            contentType: 'application/json',
                            type: 'GET',
                            success: function (shuttles) {
                                setShuttlesTable(shuttles);
                            }
                        });
                    }
                });
            }
        });
}
