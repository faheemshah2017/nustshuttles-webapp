var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  data = { 
    title: 'Nust Shuttles',
    plugins: ['charts']
  }
  res.render('index', data);
});

router.get('/login', function(req, res, next) {
  data = { 
    title: 'Login | Nust Shuttles',
    plugins: []
  }
  res.render('login', data);
});

router.get('/register', function(req, res, next) {
  data = { 
    title: 'Register | Nust Shuttles',
    plugins: []
  }
  res.render('register', data);
});


module.exports = router;
