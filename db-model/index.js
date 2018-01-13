/**
 * db models
 */

const mongoose = require('mongoose');

require('./user');
require('./session');
require('./message');

let db = mongoose.createConnection('localhost', 'mychat');
db.on('error', function(err) {
  throw err;
});

let userModel = db.model('users');
let sessionModel = db.model('sessions');
let messageModel = db.model('messages');

module.exports = {
  sourceDb: db,
  userModel,
  sessionModel,
  messageModel
};
