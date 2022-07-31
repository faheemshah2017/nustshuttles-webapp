var express = require("express");
var router = express.Router();

authUser = function (req, res, next) {
  console.log(req.user);
  if (req.isAuthenticated()) {
    console.log("User logged in");
    next();
  } else {
    console.log("User not logged in");
    res.redirect("/login");
  }
};

saveLogs = (message) => {
  return (req, res, next) => {
    let log = "";
    if (req.body.id) {
      log = `${Date()}: ${req.user.firstName} ${req.user.lastName} ${message} ${
        req.body.id
      }`;
    } else {
      log = `${Date()}: ${req.user.firstName} ${req.user.lastName} ${message}`;
    }
    let data = {
      message: log,
      user: req.user,
      time: Date(),
    };
    col_logs.insertOne(data, function (err, res) {
      next();
    });
  };
};

/* GET home page. */
router.get("/", authUser, function (req, res, next) {
  data_model.getSummary(col_shuttlesData, getCurrentDate(), (r) => {
    data = {
      page: "analytics",
      title: "Analytics | Nust Shuttles",
      plugins: [],
      user: req.user,
      allShuttlesSum: r,
    };
    res.render("analytics", data);
  });
});

router.get("/:id", authUser, function (req, res, next) {
  data_model.getlatlngByDate(col_shuttlesData, getCurrentDate(), (d) => {
    const groupByDevice = d.reduce((group, data) => {
      const { deviceId } = data;
      group[deviceId] = group[deviceId] ?? [];
      group[deviceId].push(data);
      return group;
    }, {});

    let devices = Object.keys(groupByDevice);
    let totalDistance = 0;
    let deviceDistance = {}
    if (devices.length > 1) {
      devices.forEach((d) => {
        let deviceArray = groupByDevice[d];
        let distance = calculateTotalDistance(deviceArray);
        totalDistance += distance;
        deviceDistance[deviceArray[0].deviceId] = Math.round(distance)
      });
    }
    console.log(deviceDistance)
    data_model.getSummary(col_shuttlesData, getCurrentDate(), (r) => {
      let avg_speed = 0;
      let top_speed = 0;
      let top_speed_bus = "";
      r.forEach((e) => {
        avg_speed += e.avg_speed;
        if (e.top_speed > top_speed) {
          top_speed = e.top_speed;
          top_speed_bus = e._id.shuttleNumber;
        }
      });
      avg_speed = parseInt(avg_speed / r.length);

      data_model.getAll(col_tracking, (tracking) => {
        data = {
          page: "analytics",
          title: req.params.id+" | Analytics",
          plugins: [],
          tracking: tracking,
          user: req.user,
          avg_speed: avg_speed,
          top_speed: top_speed,
          top_speed_bus: top_speed_bus,
          allShuttlesSum: r,
          dDistance:deviceDistance,
          totalDistance: parseInt(totalDistance),
        };
        res.render("sdetails", data);
      });
    });
  });
});

function distance(lat1, lat2, lon1, lon2) {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return c * r;
}

function calculateTotalDistance(path) {
  let totalDistance = 0;
  path.forEach((point, i) => {
    try {
      totalDistance += distance(
        path[i].latitude,
        path[i + 1].latitude,
        path[i].longitude,
        path[i + 1].longitude
      );
    } catch (e) {}
  });
  return totalDistance;
}

function getCurrentDate() {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${year}-${month}-${day}`;
}
module.exports = router;
