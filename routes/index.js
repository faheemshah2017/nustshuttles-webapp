var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  data_model.getAll(col_shuttles, (resp) => {
    data = {
      title: 'Nust Shuttles',
      plugins: ['charts'],
      shuttles: resp
    }
    res.render('index', data);
  })
});

router.get('/login', function (req, res, next) {
  data = {
    title: 'Login | Nust Shuttles',
    plugins: []
  }
  res.render('login', data);
});

router.get('/register', function (req, res, next) {
  data = {
    title: 'Register | Nust Shuttles',
    plugins: []
  }
  res.render('register', data);
});

router.post('/shuttleLocation', function (req, res, next) {
  data_model.add(col_shuttles, req.body, (resp) => {
    res.send(resp)
  })
});

router.get('/shuttleLocation', function (req, res, next) {
  data_model.getAll(col_shuttles, (resp) => {
    res.send(resp)
  })
});


module.exports = router;
