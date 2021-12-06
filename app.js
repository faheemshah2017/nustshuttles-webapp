var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

passport = require('passport');
session = require('express-session');
var cors = require('cors');

var flash = require('connect-flash');
MongoStore = require('connect-mongo')(session)
appRoot = path.resolve(__dirname);
SysConfig = require(appRoot + "/config/sys_config.json");

MongoClient = require('mongodb').MongoClient;
assert = require('assert');
ObjectId = require('mongodb').ObjectId;

var app = express();

// Passport Config
require('./config/passport')(passport);

authSecurity = function (req, res, next) {
    if (req.session.sc) {
        return next();
    } else {
        res.redirect('/login');
    }
}

authUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        console.log('User logged in');
        next()
    } else {
        console.log('User not logged in');
        res.redirect('/login');
    }
}

mongodb = require('./lib/mongo_db.js')

mongodb.connectToMongo(function (db_conn) {
    col_users = db_conn.collection('users');
    col_settings = db_conn.collection('settings');
});

const user = encodeURIComponent(SysConfig.settings.db.username);
const password = encodeURIComponent(SysConfig.settings.db.password);
const host = SysConfig.settings.db.host;
const port = SysConfig.settings.db.port;
const authMechanism = SysConfig.settings.db.authMechanism;
const dbName = SysConfig.settings.db.dbName;

if (host == 'localhost' || host == '127.0.0.1') {
    //DBurl = `mongodb://${host}:${port}/`;
    if (user == '' || password == '') {
        DBurl = `mongodb://${host}:${port}/`;
    } else {
        DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
    }
} else {
    if (user == '' || password == '') {
        console.log('Authentication Failed, Username and Password is required.');
    } else {
        DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;
    }
}

app.use(session({
  key: 'sid',
  secret: SysConfig.settings.sessions.secret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
      url: DBurl,
      collection: 'sessions'
  }),
  cookie: {
      expires: 600000000
  }
}));

app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next();
})

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use(flash());


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// Models
data_model = require('./models/data_model');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;


