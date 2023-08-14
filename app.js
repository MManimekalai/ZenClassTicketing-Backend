var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

const ENV = require('dotenv');

ENV.config();
require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminLoginRouter = require("./routes/admin/login");
var adminMentorRegRouter = require("./routes/admin/mentor");
var adminStudentRegRouter = require("./routes/admin/students");
var studentQueryRouter = require("./routes/students/query");
var adminQueryListRouter = require("./routes/admin/query");
var mentorQueryRouter = require("./routes/mentors/query")

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin/login', adminLoginRouter);
app.use('/admin/mentor', adminMentorRegRouter);
app.use('/admin/students', adminStudentRegRouter);
app.use('/admin/query', adminQueryListRouter);
app.use('/mentors/query', mentorQueryRouter);
app.use('/students/query', studentQueryRouter);

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

const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


module.exports = app;
