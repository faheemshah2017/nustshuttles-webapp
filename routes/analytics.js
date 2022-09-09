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
  data_model.getSummaryMonthly(col_shuttlesData,getCurrentYear(),getCurrentMonth(), (r) => {
    console.log(r)
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

router.get("/:deviceid/:shuttlenumber", authUser, function (req, res, next) {
  data_model.shuttlelatlngByMonth(col_shuttlesData,req.params.deviceid,getCurrentYear(),getCurrentMonth(), (d) => {
    data_model.getDeviceSummaryMonthly(col_shuttlesData,req.params.deviceid,getCurrentYear(),getCurrentMonth(), (r) => {
      const groupByDay = d.reduce((group, data) => {
        const { day } = data;
        group[day] = group[day] ?? [];
        group[day].push(data);
        return group;
      }, {});
      let days = Object.keys(groupByDay);
      let totalDistance = 0;
      let dailyDistance = {}
      if (days.length > 1) {
        days.forEach((d) => {
          let daysArray = groupByDay[d];
          let distance = calculateTotalDistance(daysArray);
          totalDistance += distance;
          dailyDistance[daysArray[0].day] = Math.round(distance)
        });
      }
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
      const date = new Date();
      avg_speed = Math.round(avg_speed / r.length);
        data = {
          page: "analytics",
          title: "Shuttle#"+req.params.shuttlenumber+" | Analytics",
          plugins: ["charts"],
          user: req.user,
          avg_speed: avg_speed,
          top_speed: top_speed,
          top_speed_bus: req.params.shuttlenumber,
          allShuttlesSum: r,
          shuttle:req.params.shuttlenumber,
          totalDistance: Math.round(totalDistance),
          dailyDistance: dailyDistance,
          month:date.toLocaleDateString("en", {month: "short"}),
          year:date.getFullYear()
        };
        res.render("sdetails", data);
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
      let dist = distance(
        path[i].latitude,
        path[i + 1].latitude,
        path[i].longitude,
        path[i + 1].longitude
      );
      if(dist<1){
        totalDistance +=dist
      }
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
function getCurrentYear() {
  const date = new Date();
  let year = date.getFullYear();
  return year;
}
function getCurrentMonth() {
  const date = new Date();
  let month = date.getMonth() + 1;
  return month;
}
module.exports = router;
