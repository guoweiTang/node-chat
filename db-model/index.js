/**
 * mongoose models
 */
const userModel = require('./user');
const messageModel = require('./message');
const sessionModel = require('./session');
module.exports = {
    userModel: userModel,
    messageModel: messageModel,
    sessionModel: sessionModel
}