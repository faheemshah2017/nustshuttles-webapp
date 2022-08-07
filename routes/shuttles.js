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
  let hours = dataDate.getHours()+5;
  let minutes = dataDate.getMinutes();
  time = hours+(minutes/100)
  console.log("data received from deviceId: "+req.body.deviceId)
  if(time>17.00||time<8.30){
    console.log("its off time")
    shuttleData.idleTIme = 0;
  }
  else{
    if(shuttleData.speed==0){
      console.log("Shuttle is idle")
      shuttleData.idleTIme = 10;
    }
    else{
      console.log("shuttle is active")
      shuttleData.idleTIme = 0;
    }  
    console.log("saving data for deviceId: "+req.body.deviceId)
    data_model.add(col_shuttlesData, shuttleData, (resp) => {
      data_model.getDataBy(col_shuttles,"deviceId", req.body.deviceId, async (shuttle) => {
        let data = {
          deviceId:req.body.deviceId,
          busNumber:shuttle.shuttleNumber,
          latitude:req.body.latitude,
          logitude:req.body.longitude,
          speed:req.body.speed,
          time:req.body.time
        }
        if(shuttle){
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
    })
  }
})

module.exports = router;
