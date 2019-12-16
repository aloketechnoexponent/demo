require('module-alias/register');
const config = require('@config');

const fileUpload = require('express-fileupload');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const firebase = require("firebase-admin");
const apiRouter = require('@routes/api');
const adminRouter = require('@routes/admin');
const webRouter = require('@routes/web');
var app = express();
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//===========================CORS support==============================
app.use(function (req, res, next) {
  req.setEncoding('utf8'); // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");// Request methods you wish to allow
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");  // Request headers you wish to allow
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, index , authorization");
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

// firebase.initializeApp({
//   credential: firebase.credential.cert({
//     projectId: config.FIREBASE.PROJECT_ID,
//     clientEmail: config.FIREBASE.CLIENT_EMAIL,
//     privateKey: config.FIREBASE.PRIVATE_KEY
//   }),
//   databaseURL: config.FIREBASE.DATABASE_URL
// });
apiRouter(app);
// adminRouter(app);
webRouter(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
