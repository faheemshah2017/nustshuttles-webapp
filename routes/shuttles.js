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
  data_model.add(col_shuttlesData, req.body, (resp) => {
    data_model.update(col_tracking, "deviceId", req.body.deviceId, req.body, (resp) => {
      res.send(resp)
    })
  })
})

module.exports = router;
