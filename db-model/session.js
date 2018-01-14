/**
 * session model
 */
const mongoose = require('mongoose');

let sessionSchema = new mongoose.Schema({
    "sessionId": {
        type: String,
        required: true
    },
    "sessionIcon": {
        type: String,
        required: true
    },
    "sessionName": {
        type: String,
        required: true
    },
    "createTime": {
        type: Date,
        default: new Date()
    }, 
    "unreadCount": {
        type: Number,
        default: 0
    }, 
    // status {0:正常状态, 1:已删除, 2:已置顶}，注意：三种状态是互斥的
    "status": {
        type: Number,
        default: 0
    }, 

    // 参数参考./message.js
    "lastMsg": {
        "msgType": Number, 
        "senderId": String, 
        "msgId": String, 
        "msgContent": String, 
        "createTime": Date
    }
});
let sessionModel = mongoose.model('sessions', sessionSchema);

module.exports = sessionModel;
