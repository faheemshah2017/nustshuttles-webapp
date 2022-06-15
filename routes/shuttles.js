var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  data_model.getAll(col_shuttles, (shuttles) => {
    data_model.getAll(col_routes, (routes) => {
      data = {
        page: 'shuttles',
        title: 'Nust Shuttles',
        plugins: ['charts'],
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
  data_model.add(col_shuttles, req.body, (resp) => {
    res.send(resp)
  })
});

router.delete('/delete/:id', function (req, res, next) {
  data_model.delete(col_shuttles, req.params.id, (resp) => {
    res.send(resp)
  })
});

router.post('/update/:id', function (req, res, next) {
  data_model.update(col_shuttles, req.params.id, req.body, (resp) => {
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
  console.log(req.body)
  data_model.add(col_shuttlesData, req.body, (resp) => {
    console.log(req.body.deviceId)
    req.body.logitude = req.body.longitude
    data_model.getDataBy(col_shuttles,"deviceId", req.body.deviceId, (shuttle) => {
      console.log("shuttle",shuttle)
      if(shuttle){
        req.body.busNumber = shuttle.shuttleNumber;
        ref.child(req.body.deviceId).set(req.body);
        delete req.body.busNumber
      }
      delete req.body.longitude
      delete req.body._id;
      data_model.updateBy(col_tracking, "deviceId", req.body.deviceId, req.body, (resp) => {
        res.send(resp)
      })
    })
  })
})

module.exports = router;
