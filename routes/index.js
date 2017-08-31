var express = require('express');
var router = express.Router();
var util = require('./util');
let mongoose = require('mongoose');
let db = mongoose.createConnection('localhost', 'mychat');

let sessionSchema = new mongoose.Schema({
    "sessionId": String, 
    "createTime": Date, 
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


/**
 * 获取会话列表
 */
router.get('/chat-test/getSessionList.json', function(req, res, next) {
    var user = req.session.user;
    //主动创建的会话和别人对自己创建的会话都要查出来
    sessionModel.find({
        sessionId: new RegExp('^' + user.id + '-\\d+$')
    }, function(err, sessions) {
        if(err) throw err;

        //按最新会话时间排序
        sessions.sort(function(prev, next) {
            return (new Date(next.lastMsg.createTime)).getTime() - (new Date(prev.lastMsg.createTime)).getTime();
        })
        res.send({
            "content": {
                "rows": sessions
            },
            "message": "操作成功",
            "state": 1
        })
    })

});


/**
 * 获取会话详情
 */
router.get('/chat-test/getMessages.json', function(req, res, next) {
    var reqSessionId = req.param('sessionId');
    messageModel.find({
        sessionId: util.getBothSessionIdRegExp(reqSessionId)
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
/**
 * 发送消息
 */
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
            "content": data,
            "message": "操作成功",
            "state": 1
        });
    })

    /**
     * 更新双方会话最后一条消息
     */
    delete message.sessionId;
    sessionModel.updateOne({
        "sessionId": req.param('sessionId')
    }, {
        "lastMsg": message
    }, function(err, session) {
        if(err)throw err;
        console.log('更新发送方会话最后一条消息成功！');
    })
    //更新对方会话
    let sessionIdArr = req.param('sessionId').split('-');
    let othersSessionId = [sessionIdArr[1], sessionIdArr[0]].join('-');
    sessionModel.findOne({
        "sessionId": othersSessionId
    }, function(err, session) {
        if(err)throw err;
        sessionModel.updateOne({
            "sessionId": othersSessionId
        }, {
            "lastMsg": message,
            "unreadCount": (session.unreadCount || 0) + 1
        }, function(err, session) {
            if(err)throw err;
            console.log('更新对方最后一条消息成功');
        })
    })

});
/**
 * 更新已读状态
 */
router.get('/chat-test/readed.json', function(req, res, next) {
    var reqSessionId = req.param('sessionId');
    sessionModel.updateOne({
        "sessionId": reqSessionId
    }, {
        "unreadCount": 0
    }, function(err, session) {
        if(err)throw err;
        res.send({
            "message": "操作成功",
            "state": 1
        });
        console.log('更新已读状态成功');
    })
});


module.exports = router;