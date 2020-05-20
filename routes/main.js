const express = require('express');
const config = require('../lib/config');
let router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  //已登录
  let user = req.session.user;
  if (user) {
    //页面制作中……
    res.render('index/index');
  } else {
    res.redirect(config.pathPrefix.auth + '/login.html');
  }
});


module.exports = router;
