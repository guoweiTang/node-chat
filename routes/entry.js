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
    "createTime": Date, 
    "unreadCount": Number, 
    "status": Number, //status{0:正常状态, 1:已删除, 2:已置顶}，注意：三种状态是互斥的
    "lastMsg": {
        "msgType": Number, //msgType{0:文本, 1:图文混合, 2:图片, 3:语音}
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
    let user = req.session.user;
    if(user){
		//查询用户列表
		userModel.find({}, function(err, data) {
			var userList = [];
			if(err) throw err;

            //本人排序置顶
            var tempIndex = -1;
            data.forEach(function(theData, index) {
                if(theData.id == user.id){
                    tempIndex = index;
                }
            })
            data.unshift(data.splice(tempIndex, 1)[0]);

			res.render('index/entry', {
				users: data
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
                //会话状态为删除
                if(data.status === 1){
                    sessionModel.updateOne({
                        "sessionId": sessionId
                    }, {
                        "status": 0
                    }, function(err, session) {
                        if(err)throw err;
                        console.log('被删除会话重置为有效！');
                        res.redirect('/');
                    })
                }else{
                    res.redirect('/');
                }
			}else{
                userModel.findOne({
                    id: othersId
                }, function(err, theUser) {
                    if(err) throw err;
                    if(theUser){
                        let now = new Date();
                        let session = {
                            "sessionId": sessionId,
                            "sessionIcon": theUser.picture,
                            "sessionName": theUser.name,
                            "createTime": now,
                            "unreadCount": 0,
                            "status": 0
                        };
                        //创建本人会话
                        sessionModel.create(session, function(err, data) {
                            if(err) throw err;
                            res.redirect('/');
                        })

                        session.sessionId = [othersId, user.id].join('-');
                        session.sessionIcon = user.picture;
                        session.sessionName = user.name;
                        //创建对方会话
                        sessionModel.create(session, function(err, data) {
                            if(err){
                                throw err;
                            }
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
