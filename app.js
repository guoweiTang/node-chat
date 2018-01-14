const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
// const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//基于cookie-parser的会话设置（https://github.com/expressjs/cookie-session）
const cookieSession = require('cookie-session');
const routes = require('./routes');

/**
 * 连接数据库
 */
require('./db-model');

const app = express();

// 模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/**
 * 一些组件
 */
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['ice', 'tang']
}))
app.use(express.static(path.join(__dirname, 'public')));


// 注册全局变量
app.use(function(req, res, next){
  app.locals.session = req.session;
  next();
})

// 注册业务路由器
app.use(routes);


/**
 * 路由容错处理
 */
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
