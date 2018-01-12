/**
 * session model
 */
const mongoose = require('mongoose');

let sessionSchema = new mongoose.Schema({
    "sessionId": String, 
    "createTime": Date, 
    "unreadCount": Number, 
    "status": Number, 
    "lastMsg": {
        "msgType": Number, //msgType{0:文本, 1:图文混合, 2:图片, 3:语音}
        "senderId": String, 
        "msgId": String, 
        "msgContent": String, 
        "createTime": Date
    }
});
let sessionModel = mongoose.model('sessions', sessionSchema);

module.exports = sessionModel;
