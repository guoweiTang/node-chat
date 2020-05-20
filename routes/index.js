/**
 * route entry file
 */

const express = require('express');
const config = require('../lib/config');

const passport = require('./passport');
const index = require('./main');
const account = require('./account');
const peopleList = require('./people-list');
const chat = require('./chat');

let router = express.Router();

// 登录、注册
router.use(config.pathPrefix.auth, passport);

// 首页
router.use(config.pathPrefix.index, index);

// 个人信息
router.use(config.pathPrefix.account, account);

// 注册用户列表
router.use(config.pathPrefix.peopleList, peopleList);

// 聊天
router.use(config.pathPrefix.chat, chat);

module.exports = router;
