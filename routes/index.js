var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let db = mongoose.createConnection('localhost', 'mychat');

let sessionSchema = new mongoose.Schema({
    "sessionId": String, 
    "updateTime": Date, 
    "unreadCount": Number, 
    "status": Number, 
    "lastMsg": {
        "msgType": Number, 
        "senderId": String, 
        "msgId": String, 
        "msgContent": String, 
        "createTime": Date
    }
});
let messageSchema = new mongoose.Schema({
    "sessionId": String,
    "msgType": Number, 
    "senderId": String, 
    "msgId": String, 
    "msgContent": String, 
    "createTime": String
});
let sessionModel = db.model('sessions', sessionSchema);
let messageModel = db.model('messages', messageSchema);
/* GET home page. */
router.get('/', function(req, res, next) {
    //已登录
    if(req.session.user){
        res.render('index/index');
    }else{
        res.redirect('/login.html');
    }
});
router.get('/chat-test/getSessionList.json', function(req, res, next) {
    var user = req.session.user;
    //主动创建的会话和别人对自己创建的会话都要查出来
    sessionModel.find({
        sessionId: new RegExp('^' + user.id + '-\\d+$')
    }, function(err, sessions) {
        if(err) throw err;
        res.send({
            "content": {
                "rows": sessions
            },
            "message": "操作成功",
            "state": 1
        })
    })

});
router.get('/chat-test/getMessages.json', function(req, res, next) {
    var reqSessionId = req.param('sessionId');
    var sessionIdV2 = [reqSessionId.split('-')[1], reqSessionId.split('-')[0]].join('-');
    messageModel.find({
        sessionId: new RegExp('^(' + reqSessionId + ')\|(' + sessionIdV2 + ')$')
    }, function(err, messages) {
        if(err) throw err;
        res.send({
            "content": {
                "rows": messages
            },
            "message": "操作成功",
            "state": 1
        })
    })
});
router.get('/chat-test/sendMsg.json', function(req, res, next) {
    var message = {
        "sessionId": req.param('sessionId'),
        "msgType": req.param('msgType'), 
        "senderId": req.param('senderId'), 
        "msgId": String(+ new Date()),
        "msgContent": req.param('msgContent'), 
        "createTime": req.param('createTime')
    }
    messageModel.create(message, function(err, data) {
        if(err){
            throw err;
            return;
        }
        res.send({
            "message": "操作成功",
            "state": 1
        });
    })
});

module.exports = router;