/**
 * message model
 */
const mongoose = require('mongoose');

let messageSchema = new mongoose.Schema({
    "sessionId": {
        type: String,
        index: true
    },
    // msgType{0:文本, 1:图文混合, 2:图片, 3:语音}
    "msgType": {
        type: Number,
        default: 0
    }, 
    "senderId": {
        type: String,
        rquired: true
    }, 
    "msgId": {
        type: String,
        rquired: true
    }, 
    "msgContent": {
        type: String,
        rquired: true
    }, 
    "createTime": {
        type: Date,
        default: new Date()
    }, 
});
let messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
