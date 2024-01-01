var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  data_model.getAll(col_shuttles, (shuttles) => {
    data_model.getAll(col_routes, (routes) => {      
      data = {
        page: 'shuttles',
        title: 'Nust Shuttles',
        plugins: [],
        shuttles: shuttles,
        user: req.user,
        routes: routes
      }
      res.render('shuttles', data);
    })
  })
});

router.get('/get', function (req, res, next) {
  data_model.getAll(col_shuttles, (shuttles) => {
    res.send(shuttles)
  })
});

router.post('/add', function (req, res, next) {
  data_model.add(col_shuttles, req.body,async (resp) => {
    try{
      const child = ref.child(req.body.deviceId)
      await child.update(req.body);
    }
    catch(e){
      console.log(e)
    }
    res.send(resp)
  })
});

router.delete('/delete/:id', function (req, res, next) {
  data_model.delete(col_shuttles, req.params.id, (resp) => {
    res.send(resp)
  })
});

router.post('/update/:id', function (req, res, next) {
  data_model.update(col_shuttles, req.params.id, req.body,async (resp) => {
    try{
      const child = ref.child(req.body.deviceId)
      await child.update(req.body);
    }
    catch(e){
      console.log(e)
    }
    res.send(resp)
  })
});


router.post('/location', function (req, res, next) {
  data_model.add(col_shuttles, req.body, (resp) => {
    res.send(resp)
  })
});

router.get('/location', function (req, res, next) {
  data_model.getAll(col_shuttles, (resp) => {
    res.send(resp)
  })
});

shuttlesStates = {

}

router.post('/sendLocation', (req, res, next) => {
  
  let shuttleData = {
    deviceId:req.body.deviceId,
    latitude:parseFloat(req.body.latitude),
    longitude:parseFloat(req.body.longitude),
    speed:parseInt(req.body.speed),
    time:parseInt(req.body.time),
    location:{
      type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]
    },
    datetime:new Date(parseInt(req.body.time)*1000)
  }  
  const dataDate = new Date(shuttleData.time * 1000);
  let hours = dataDate.getHours();
  let minutes = dataDate.getMinutes();
  let day = dataDate.getDay()
  time = hours+(minutes/100)
  console.log("data received from deviceId: "+req.body.deviceId)
  if(!shuttlesStates[req.body.deviceId]){
    console.log("setting shuttlesStates variable for shuttle#"+req.body.deviceId)
    shuttlesStates[req.body.deviceId] = 0
  }
  if((time>17.00||time<8.30||day>5)&&shuttleData.speed==0){
    console.log("its off time")
    shuttleData.idleTime = 0;
    shuttleData.stoppedTime = 0;
    updateTracking(req,res,shuttleData,time,false)
  }
  else{
    if(shuttleData.speed==0){
      shuttlesStates[req.body.deviceId]+=20;
      if(shuttlesStates[req.body.deviceId]>300){
        console.log("Shuttle is stopped")
        shuttleData.idleTime = 0;
        shuttleData.stoppedTime = 20;
      }
      else if(shuttlesStates[req.body.deviceId]>120){
        console.log("Shuttle is idle")
        shuttleData.idleTime = 20;
        shuttleData.stoppedTime = 0;
      }
      else{
        console.log("Shuttle speed is zero since: "+shuttlesStates[req.body.deviceId])
      }
    }
    else{
      console.log("shuttle is active")
      shuttlesStates[req.body.deviceId] = 0;
      shuttleData.idleTime = 0;
      shuttleData.stoppedTime = 0;
    }  
    data_model.add(col_shuttlesData, shuttleData, (resp) => {
        updateTracking(req,res,shuttleData,time,true)
    })
  }
})

function updateTracking(req,res,shuttleData,time,routeCheck){
  data_model.getDataBy(col_shuttles,"deviceId", req.body.deviceId, async (shuttle) => {
    let selectedRoute = shuttle.route.find(r=>{
      r.from = parseFloat(r.from.split(":").join("."))
      r.to = parseFloat(r.to.split(":").join("."))
      return (r.from<time&&r.to>time)
    })
    distanceFromRoute = 0
    if(selectedRoute){
      let distArray = [];
      selectedRoute.path.forEach(p=> {
            let dist = distance(
              p.lat,
              shuttleData.latitude,
              p.lng,
              shuttleData.longitude
            );
            distArray.push(dist)
      });
      distArray.sort();
      distanceFromRoute = distArray[0]*1000
    }
    console.log(distanceFromRoute)
    alertData = {
      "time":new Date(parseInt(req.body.time)*1000),
      "shuttleNumber": shuttle.shuttleNumber,
      "speed":req.body.speed,
      "location":{
        type:"Point",coordinates:[parseFloat(req.body.longitude),parseFloat(req.body.latitude)]
      }
    }
    if(shuttleData.speed>40){
      alertData.message = `Shuttle#${shuttle.shuttleNumber} violated the speed limit (speed:${req.body.speed})`
      console.log(alertData)
      data_model.add(col_alerts, alertData, (resp) => {});
    }
    
    if(distanceFromRoute>200&&routeCheck){
      alertData.message = `Shuttle#${shuttle.shuttleNumber} violated its route`
      console.log(alertData)
      data_model.add(col_alerts, alertData, (resp) => {});
    }
    let data = {
      deviceId:req.body.deviceId,
      busNumber:shuttle.shuttleNumber,
      latitude:req.body.latitude,
      logitude:req.body.longitude,
      speed:req.body.speed,
      time:req.body.time,
      lastActiveTime:`${Date.now()}`
    }

    // Check if the speed is not zero
    if (data.speed !== "0") {
      data.activeStatus = "active";
      req.body.lastActiveTime = Date.now();
    } else {
      // Set the status to inactive initially
      data.activeStatus = "inactive";
      // If it's been more than 5 minutes since the last active time, set the status to stop
      if(shuttlesStates[req.body.deviceId]==300){
        console.log("setting stop")
        data.activeStatus = "stop";
      }
    }
    if(shuttle&&(shuttlesStates[req.body.deviceId]==300||shuttlesStates[req.body.deviceId]==20||data.speed !== "0")){
      try{
        const child = ref.child(req.body.deviceId)
        await child.update(data);
      }
      catch(e){
        console.log(e)
      }
    }
    delete req.body._id;
    data_model.updateBy(col_tracking, "deviceId", req.body.deviceId, req.body, (resp) => {
      res.send(resp)
    })
  })
}

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

module.exports = router;
