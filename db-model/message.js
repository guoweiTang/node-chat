/**
 * message model
 */
const mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
    "sessionId": String,
    "msgType": Number, 
    "senderId": String, 
    "msgId": String, 
    "msgContent": String, 
    "createTime": String
});
let messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
