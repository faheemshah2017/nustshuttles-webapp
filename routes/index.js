var express = require('express');
var router = express.Router();

authUser = function (req, res, next) {
  console.log(req.user)
  if (req.isAuthenticated()) {
    console.log('User logged in');
    next()
  } else {
    console.log('User not logged in');
    res.redirect('/login');
  }
}

saveLogs = message => {
  return (req, res, next) => {
    let log = ""
    if (req.body.id) {
      log = `${Date()}: ${req.user.firstName} ${req.user.lastName} ${message} ${req.body.id}`;
    }
    else {
      log = `${Date()}: ${req.user.firstName} ${req.user.lastName} ${message}`;
    }
    let data = {
      message: log,
      user: req.user,
      time: Date()
    }
    col_logs.insertOne(data, function (err, res) {
      next();
    });
  }
}

/* GET home page. */
router.get('/', authUser, function (req, res, next) {
  console.log(req.user)
  data_model.getAll(col_shuttles, (resp) => {
    data_model.getAll(col_tracking, (tracking) => {
      console.log(tracking)
      data = {
        page: '',
        title: 'Nust Shuttles',
        plugins: ['charts'],
        shuttles: resp,
        tracking: tracking,
        user: req.user,
      }
      res.render('index', data);
    });
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

router.get('/settings', authUser, function (req, res, next) {
  if (req.user.role != "manager") {
    res.redirect('/');
  } else {
    data_model.getAll(col_settings, (settings) => {
      user_model.getUsers(function (users) {
        data_model.getAll(col_alerts, function (alerts) {
          data_model.getAll(col_logs, function (logs) {
            const data = {
              title: 'Settings',
              settings: settings,
              users: users,
              alerts: alerts,
              user: req.user,
              page: 'settings',
              plugins: [],
              logs: logs
            }
            res.render('settings', data);
          });
        });
      });
    });
  }
});




module.exports = router;
