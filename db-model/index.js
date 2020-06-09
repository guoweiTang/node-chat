/**
 * db models
 */

const mongoose = require('mongoose');

require('./user');
require('./session');
require('./message');

let db = mongoose.createConnection('mongodb://localhost:27017/mychat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'ice',
  pass: 'hate10086',
}, function (err) {
  if (err) {
    throw err;
  }
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
