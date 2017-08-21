var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let db = mongoose.createConnection('localhost', 'mychat');

let userSchema = new mongoose.Schema({
	id: String,
	name: String,
	picture: String
});
let sessionSchema = new mongoose.Schema({
    "sessionId": String,
    "sessionIcon": String,
    "sessionName": String,
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

let userModel = db.model('users', userSchema);
let sessionModel = db.model('sessions', sessionSchema);
let messageModel = db.model('messages', messageSchema);

/* GET users listing. */
router.get('/entry.html', function(req, res, next) {
    //已登录
    if(req.session.user){
		//查询用户列表
		userModel.find({}, function(err, data) {
			var userList = [];
			if(err) throw err;
			if(data.length){
				userList = data;
			}
			res.render('index/entry', {
				users: userList
			})
		})
    }else{
        res.redirect('/login.html');
    }
});

router.get('/createSession/:id', function(req, res) {
    let user = req.session.user;
    let othersId = req.params.id;
    let sessionId = user.id + '-' + othersId;
    //已登录
    if(user){
		sessionModel.findOne({
            sessionId: sessionId,
		}, function(err, data) {
			if(err) throw err;
            //存在会话
			if(data){
				res.redirect('/');
			}else{
                userModel.findOne({
                    id: othersId
                }, function(err, theUser) {
                    if(err) throw err;
                    if(theUser){
                        let now = new Date();
                        let message = {
                            "msgType":0,
                            "senderId": user.id,
                            "msgId": String(+ new Date()),
                            "msgContent": "你好",
                            "createTime": now
                        };
                        let session = {
                            "sessionId": sessionId,
                            "sessionIcon": theUser.picture,
                            "sessionName": theUser.name,
                            "updateTime": now,
                            "unreadCount": 0,
                            "status": 0,
                            "lastMsg": message
                        };
                        console.log(session);
                        //创建会话
                        sessionModel.create(session, function(err, data) {
                            if(err){
                                throw err;
                                return;
                            }
                            message.sessionId = sessionId;
                            messageModel.create(message, function(err, data) {
                                if(err){
                                    throw err;
                                    return;
                                }
                                res.redirect('/');
                            })
                        })

                        session.sessionId = [sessionId.split('-')[1], sessionId.split('-')[0]].join('-');
                        session.sessionIcon = user.picture;
                        session.sessionName = user.name;
                        //创建会话
                        sessionModel.create(session, function(err, data) {
                            if(err){
                                throw err;
                                return;
                            }
                            console.log('创建对方会话成功');
                        })
                    }
                })

            }
			
		})
    }else{
        res.redirect('/login.html');
    }
})

module.exports = router;
