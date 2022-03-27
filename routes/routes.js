var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    data_model.getAll(col_routes, (resp) => {
      data = {
        title: 'Nust Shuttles',
        plugins: ['charts'],
        routes: resp
      }
      res.render('routes', data);
    })
});
router.post('/add', function (req, res, next) {
    data_model.add(col_routes, req.body, (resp) => {
        res.send(resp)
    })
});

router.get('/get', function (req, res, next) {
    data_model.getAll(col_routes, (resp) => {
        res.send(resp)
    })
});

module.exports = router;
