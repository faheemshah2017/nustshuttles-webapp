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
        zoom: 16,
        restriction: {
            latLngBounds: {
                north: 36,
                south: 24,
                east: 77,
                west: 65,
            },
        },
        heading: -32.5,
        mapId: "90f87356969d889c",
    }, () => {
        document.getElementById("map").style.height = "800px"
    });

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

function cancelRoute() {
    $("#saveRouteBtn").css("display", "none");
    $("#cancelRouteBtn").css("display", "none");
    $("#addRouteBtn").css("display", "block");
    showLabels();
    addingRoute = false;
    // Close the current InfoWindow.
    infoWindow.close();
    newRoute = [];
    try {
        flightPath[lastRoute].setMap(null);
    }
    catch (e) { }
}

function addRoute() {
    document.getElementById("rowId").value = ""
    document.getElementById("routeTitle").value = ""
    document.getElementById("routeNumber").value = ""
    document.getElementById("pathNumber").value = ""
    document.getElementById("addBtn").style.display = 'block'
    document.getElementById("updateBtn").style.display = 'none'
    $("#saveRouteBtn").css("display", "block");
    $("#cancelRouteBtn").css("display", "block");
    $("#addRouteBtn").css("display", "none");
    newRoute = [];
    addingRoute = true;
    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
        content: "Click the map to create route",
        position: myLatlng,
    });

    try {
        flightPath[lastRoute].setMap(null);
    }
    catch (e) { }
    infoWindow.open(map);
    hideLabels();
}

function hideLabels() {
    map.set('styles', [{
        featureType: "all",
        elementType: "labels",
        stylers: [
            { visibility: "off" }
        ]
    }
    ]);
}

function showLabels() {
    map.set('styles', []);
}

const flightPath = []
var lastRoute = 0;
function changeRoute(e) {
    selectRoute(e.target.value)
}
function selectRoute(routeID) {
    let flightPlanCoordinates = routes.find(r => r._id == routeID).path;
    flightPath[routeID] = new google.maps.Polyline({
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
    flightPath[routeID].setMap(map);
    lastRoute = routeID
}

function submitRoute() {
    var values = {};
    $.each($('#data_form').serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });

    values.path = newRoute;

    $.ajax({
        url: "/routes/add",
        data: JSON.stringify(values),
        cache: false,
        processData: false,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataofconfirm) {
            $('#addRouteModal').modal('hide');
            $('.modal-backdrop').remove();

            $('form#data_form').trigger("reset");

            swal({
                type: "success",
                icon: "success",
                title: "New route added",
                showConfirmButton: !1,
                timer: 3000
            }).then(function () {
                $.ajax({
                    url: "/routes/get",
                    contentType: 'application/json',
                    type: 'GET',
                    success: function (newRoutes) {
                        routes = newRoutes;
                        setRoutesTable(routes);
                        cancelRoute();
                    }
                });
            });
        }
    });
}

function updateRoute() {
    var values = {};
    $.each($('#data_form').serializeArray(), function (i, field) {
        values[field.name] = field.value;
    });

    let id  = values.rowId
    delete values.rowId;

    $.ajax({
        url: "/routes/update/"+id,
        data: JSON.stringify(values),
        cache: false,
        processData: false,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataofconfirm) {
            $('#addRouteModal').modal('hide');
            $('.modal-backdrop').remove();

            $('form#data_form').trigger("reset");

            swal({
                type: "success",
                icon: "success",
                title: "Route Updated",
                showConfirmButton: !1,
                timer: 3000
            }).then(function () {
                $.ajax({
                    url: "/routes/get",
                    contentType: 'application/json',
                    type: 'GET',
                    success: function (routes) {
                        setRoutesTable(routes);
                        cancelRoute();
                    }
                });
            });
        }
    });
}

setRoutesTable(routes);

function setRoutesTable(routes) {

    $("#table").html("");
    let row = "";

    routes.forEach((route, i) => {

        row += `<tr><td>${route.routeTitle}</td><td>${route.routeNumber}</td>
      <td>${route.pathNumber}</td>`;
        row += `<td><button type="button" id="${route._id}" onclick="editRoute(this)"  data-toggle="modal" data-target="#addRouteModal" class="btn btn-outline-primary mb-1 mr-1"><i class="fas fa-edit"></i></button><button type="button" id="${route._id}" onclick="confirmDelete(this)" class="btn btn-outline-danger mb-1 mr-1"><i class="fas fa-trash"></i></button>`;

        row += "</tr>"

    });
    $("#table").append(row);

}

function editRoute(e){
    let route = getRouteById(e.id)
    document.getElementById("rowId").value = route._id
    document.getElementById("routeTitle").value = route.routeTitle
    document.getElementById("routeNumber").value = route.routeNumber
    document.getElementById("pathNumber").value = route.pathNumber
    document.getElementById("addBtn").style.display = 'none'
    document.getElementById("updateBtn").style.display = 'block'
}

function getRouteById(id){
    console.log(routes)
    return (routes.filter(s=>s._id==id))[0]
}

function confirmDelete(route) {
    id = route.id
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
                    url: "/routes/delete/" + id,
                    cache: false,
                    processData: false,
                    type: 'DELETE',
                    success: function (dataofconfirm) {
                        $.ajax({
                            url: "/routes/get",
                            contentType: 'application/json',
                            type: 'GET',
                            success: function (routes) {
                                setRoutesTable(routes);
                            }
                        });
                    }
                });
            }
        });
}
