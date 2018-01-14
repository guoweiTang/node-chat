const express = require('express');
const router = express.Router();
const util = require('../lib/util');
const config = require('../lib/config');
const {sessionModel, messageModel} = require('../db-model');

/* GET home page. */
router.get('/', function(req, res, next) {
    //已登录
    if(req.session.user){
        res.render('index/index');
    }else{
        res.redirect(config.pathPrefix.auth + '/login.html');
    }
});

/**
 * 获取会话信息
 */
router.get('/getSessionList.json', function(req, res, next) {
    let user = req.session.user;
    let reqSessionId = req.query.sessionId;
    
    //　查询单一会话状态（更新删除状态为正常状态）
    if(reqSessionId){
        sessionModel.findOne({
            "sessionId": reqSessionId
        }, function(err, session) {
            if(err)throw err;
            if(session.status === 1){
                sessionModel.updateOne({
                    "sessionId": reqSessionId
                }, {
                    status: 0
                }, function(err) {
                    if(err)throw err;
                    session.status = 0;
                    res.send({
                        "content": session,
                        "message": "操作成功",
                        "state": 1
                    })
                })
            }else{
                res.send({
                    "content": session,
                    "message": "操作成功",
                    "state": 1
                })
            }
        })
    //查询会话列表
    }else{
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
                //过滤已删除会话
                "content": sessions.filter(function(session){
                    return session.status != 1;
                }),
                "message": "操作成功",
                "state": 1
            })
        })
    }

});


/**
 * 获取会话详情
 */
router.get('/getMessages.json', function(req, res, next) {
    var reqSessionId = req.query.sessionId;
    messageModel.find({
        sessionId: util.getBothSessionIdRegExp(reqSessionId)
    }, function(err, messages) {
        if(err) throw err;
        res.send({
            "content": messages,
            "message": "操作成功",
            "state": 1
        })
    })
});
/**
 * 发送消息
 */
router.get('/sendMsg.json', function(req, res, next) {
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
            "content": {
                type: 'IM_SEND_MESSAGE',
                content: data
            },
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
        // console.log('update my session OK!');
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
            // console.log('update other session is OK!');
        })
    })

});
/**
 * 更新已读状态
 */
router.get('/readed.json', function(req, res, next) {
    let reqSessionId = req.param('sessionId');
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
        // console.log('更新已读状态成功');
    })
});
router.get('/updateSession.json', function(req, res, next) {
    let reqSessionId = req.param('sessionId');
    let status = req.param('status');
    sessionModel.findOneAndUpdate({
        "sessionId": reqSessionId
    }, {
        "status": status
    }, function(err, session) {
        if(err)throw err;
        session.status = status;
        res.send({
            "content": {
                type: 'IM_SESSION_UPDATE',
                content: session
            },
            "message": "操作成功",
            "state": 1
        });
    })
});


module.exports = router;