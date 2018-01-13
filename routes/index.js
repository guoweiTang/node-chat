/**
 * route entry file
 */

const express = require('express');
const config = require('../lib/config');
const main = require('./main');
const entry = require('./entry');
const passport = require('./passport');
const account = require('./account');

let router = express.Router();
router.use(config.pathPrefix.auth, passport);
router.use('/account', account);
router.use('/chat', main);
router.use(config.pathPrefix.index, entry);
router.use('/', function(req, res, next){
    res.redirect(301, config.pathPrefix.index);
});

module.exports = router;
