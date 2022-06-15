var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shuttlesRouter = require('./routes/shuttles');
var routesRouter = require('./routes/routes');

passport = require('passport');
session = require('express-session');
var cors = require('cors');

var firebaseAdmin = require("firebase-admin");

var flash = require('connect-flash');
MongoStore = require('connect-mongo')(session)
appRoot = path.resolve(__dirname);
SysConfig = require(appRoot + "/config/sys_config.json");

// Fetch the service account key JSON file contents
var serviceAccount = require(appRoot + "/config/nust-shuttles-firebase-adminsdk-wbztk-a11f61a0c1.json");

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

// Initialize the app with a service account, granting admin privileges
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  // The database URL depends on the location of the database
  databaseURL: "https://nust-shuttles-default-rtdb.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebaseAdmin.database();
ref = db.ref("/");
// ref.once("value", function (snapshot) {
//   console.log(snapshot.val());
// });

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
    col_shuttles = db_conn.collection('shuttles');
    col_routes = db_conn.collection('routes');
    col_settings = db_conn.collection('settings');
    col_alerts = db_conn.collection('alerts');
    col_logs = db_conn.collection('logs');
    col_tracking = db_conn.collection('tracking');
    col_shuttlesData = db_conn.collection('shuttlesData');
});

const user = encodeURIComponent(SysConfig.settings.liveDB.username);
const password = encodeURIComponent(SysConfig.settings.liveDB.password);
const hostname = SysConfig.settings.liveDB.hostname;
// const port = SysConfig.settings.liveDB.port;
// const authMechanism = SysConfig.settings.liveDB.authMechanism;
// const dbName = SysConfig.settings.liveDB.dbName;

// if (host == 'localhost' || host == '127.0.0.1') {
//     //DBurl = `mongodb://${host}:${port}/`;
//     if (user == '' || password == '') {
//         DBurl = `mongodb://${host}:${port}/`;
//     } else {
//         DBurl = `mongodb://${user}:${password}@${host}:${port}/${dbName}`;
//     }
// } else {
//     if (user == '' || password == '') {
//         console.log('Authentication Failed, Username and Password is required.');
//     } else {
//         DBurl = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}&authSource=${dbName}`;
//     }
// }

DBurl = `mongodb+srv://${user}:${password}@${hostname}/?retryWrites=true&w=majority`;

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

// Models
user_model = require('./models/user_model');
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
app.use('/shuttles', shuttlesRouter);
app.use('/routes', routesRouter);

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


