var express = require("express");
const data_model = require("../models/data_model");
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
    data = {
      page: "dashboard",
      title: "Nust Shuttles",
      plugins: ['charts'],
      user: req.user,
      // month: date.toLocaleDateString("en", { month: "short" }),
    };
    res.render("index", data);
});

router.get("/alerts", authUser, function (req, res, next) {
  data_model.getSome(
    col_alerts,100,
    (r) => {
      
      data = {
        page: "alerts",
        title: "Alerts",
        plugins: [],
        user: req.user,
        data:r
        // month: date.toLocaleDateString("en", { month: "short" }),
      };
      res.render("alerts", data);
    }
  );
});

router.get("/newAlerts", authUser, function (req, res, next) {
  data_model.getSome(
    col_alerts,3,
    (r) => {
      res.send(r);
    }
  );
});

router.get("/deleteAlert/:id", authUser, function (req, res, next) {
  data_model.delete(col_alerts,req.params.id,(resp)=>{
    data_model.getAll(
      col_alerts,
      (r) => {
        res.send(r);
      }
    );
  })
});

router.get("/deleteOldData/faheemshah", function (req, res, next) {
  let lastYearDate = new Date("2022-12-31T00:00:00.000Z");
  let query = {
    time: {
      $lt: lastYearDate,
    },
  };
  data_model.deleteAllByQuery(col_alerts,query,(resp)=>{
    res.send(resp)
  })
});

router.get("/getSummaryMonthly/:year/:month", authUser, function (req, res, next) {
  data_model.getSummaryMonthly(
    col_shuttlesData,
    parseInt(req.params.year),
    parseInt(req.params.month),
    (r) => {
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

      data = {
        avg_speed: avg_speed,
        top_speed: top_speed,
        top_speed_bus: top_speed_bus,
        allShuttlesSum: r,
      };
      res.send(data);
    }
  );
});

router.get("/getIdleTimeMonthly/:year/:month", authUser, function (req, res, next) {
  data_model.getIdleTimeMonthly(
    col_shuttlesData,
    parseInt(req.params.year),
    parseInt(req.params.month),
    (idle) => {
      data = {
        idleTime: idle,
      };
      res.send(data);
    }
  );
});

router.get("/getFleetDailyTrendMonthly/:year/:month", authUser, function (req, res, next) {
  data_model.getFleetDailyTrendMonthly(
    col_shuttlesData,
    parseInt(req.params.year),
    parseInt(req.params.month),
    (r) => {
      res.send({ dailyTrend: r });
    }
  );
});

router.get("/getlatlngByMonth/:year/:month", authUser, function (req, res, next) {
  data_model.getlatlngByMonth(
    col_shuttlesData,
    parseInt(req.params.year),
    parseInt(req.params.month),
    (d) => {
      const groupByDevice = d.reduce((group, data) => {
        const { deviceId } = data;
        group[deviceId] = group[deviceId] ?? [];
        group[deviceId].push(data);
        return group;
      }, {});

      let devices = Object.keys(groupByDevice);
      let totalDistance = 0;
      let deviceDistance = {};
      if (devices.length > 1) {
        devices.forEach((d) => {
          let deviceArray = groupByDevice[d];
          let distance = calculateTotalDistance(deviceArray);
            totalDistance += distance;
            deviceDistance[deviceArray[0].deviceId] = Math.round(distance);
        });
      }
      data = {
        dDistance: deviceDistance,
        totalDistance: parseInt(totalDistance),
      };
      res.send(data);
    }
  );
});

/* GET home page. */
router.get("/map", authUser, function (req, res, next) {
  data_model.getTracking(col_tracking, (tracking) => {
    data = {
      page: "map",
      title: "Nust Shuttles",
      plugins: [],
      tracking: tracking,
      user: req.user,
    };
    res.render("map", data);
  });
});

router.get("/getTracking", authUser, function (req, res, next) {
  data_model.getTracking(col_tracking, (tracking) => {
    res.send(tracking);
  });
});

router.get("/login", function (req, res, next) {
  data = {
    title: "Login | Nust Shuttles",
    plugins: [],
  };
  res.render("login", data);
});

// router.get("/register", function (req, res, next) {
//   data = {
//     title: "Register | Nust Shuttles",
//     plugins: [],
//   };
//   res.render("register", data);
// });

router.post("/shuttleLocation", function (req, res, next) {
  data_model.add(col_shuttles, req.body, (resp) => {
    res.send(resp);
  });
});

//docker run --name mongodb -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=faheemshah -e MONGO_INITDB_ROOT_PASSWORD=faheemmongodb mongo:latest
//docker run --name mongodb -d -p 27017:27017 -v $(pwd)/data:/data/db -e MONGO_INITDB_ROOT_USERNAME=faheemshah -e MONGO_INITDB_ROOT_PASSWORD=faheemmongodb mongo:latest

router.get("/shuttleData/:id", function (req, res, next) {
  data_model.getAllDataBy(
    col_shuttlesData,
    "deviceId",
    req.params.id,
    (resp) => {
      res.send(resp);
    }
  );
});

router.get("/shuttleLocation", function (req, res, next) {
  data_model.getAll(col_shuttles, (resp) => {
    res.send(resp);
  });
});

router.get("/settings", authUser, function (req, res, next) {
  if (req.user.role != "manager") {
    res.redirect("/");
  } else {
    data_model.getAll(col_settings, (settings) => {
      user_model.getUsers(function (users) {
        data_model.getAll(col_alerts, function (alerts) {
          data_model.getAll(col_logs, function (logs) {
            const data = {
              title: "Settings",
              settings: settings,
              users: users,
              alerts: alerts,
              user: req.user,
              page: "settings",
              plugins: [],
              logs: logs,
            };
            res.render("settings", data);
          });
        });
      });
    });
  }
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

const groupBy = (list, key) => {
  return list.reduce((prev, curr) => {
    return {
      ...prev,
      [curr[key]]: [...(prev[key] || []), curr],
    };
  }, {});
};

function getCurrentDate() {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return `${year}-${month}-${day}`;
  // return '2022-07-31'
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
