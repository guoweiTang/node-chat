/**
 * route entry file
 */

const express = require('express');
let router = express.Router();

const main = require('./main');
const entry = require('./entry');
const passport = require('./passport');
const account = require('./account');

router.use('/auth', passport);
router.use('/account', account);
router.use('/chat', main);
router.use('/people', entry);
router.use('/', function(req, res, next){
    res.redirect(301, '/people');
});

module.exports = router;
