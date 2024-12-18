var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var config = require('./config');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var userPostsRouter = require('./routes/user/posts');
var userProfileRouter = require('./routes/user/profile');

var cors = require('cors');
require('dotenv').config();

var app = express();
app.use(cors({origin: '*'}));

const url = process.env.MONGODB_URL;
const connect = mongoose.connect(url, {useNewUrlParser: true});

//Connect to Database test
connect.then((db)=> {
  console.log('Database connected successfully!');
}, (err)=> {
  console.log(err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/user/posts', userPostsRouter);
app.use('/user/profile', userProfileRouter);

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
