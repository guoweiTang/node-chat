var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let db = mongoose.createConnection('localhost', 'mychat');
// let sessionSchema = new mongoose.Schema({
//     sessionType: Number,
//     sessionId: String,
//     createTime: Date,
//     unreadCount: Number
//     name: String,
//     icon: String,
//     attachment: String,
//     lastMsg: {
//         senderId: String,
//         msgId: String,
//         msgType: Number,
//         msgContent: String,
//         createTime: Date
//     }
// })
// let sessionModel = db.model('sessionlist', sessionSchema);
// sessionModel.create({
//     "sessionType": 2,
//     "sessionId": "000",
//     "createTime": "1489544598000"
//     "unreadCount": 100,
//     "name": "拉勾gogo",
//     "icon": "i/image/M00/74/AF/Cgp3O1gyfseAGwyiAAAR07xJp20051.png",
//     "attachment": "{\"cUserId\":-1,\"recommend\":false,\"portrait\":\"https://www.lgstatic.com/i/image/M00/74/AF/Cgp3O1gyfseAGwyiAAAR07xJp20051.png\",\"nickName\":\"拉勾gogo\",\"realName\":\"\",\"resumeStage\":\"\",\"lastPositionName\":\"\",\"version\":1}",
//     "lastMsg": {
//         "senderId": "4503599629109891",
//         "msgId": "97618794797858818",
//         "msgType": 0,
//         "msgContent": "xzcz",
//         "createTime": "1489544598000"
//     }
// }, function(err, data) {
//     if(err) throw err;
//     res.send({
//         result: {
//             url: '/blog/myblog.html'
//         },
//         status: 1,
//         message: 'success'
//     })
// })
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/chat-test/getSessionList.json', function(req, res, next) {
    res.send({
        "content": {
            "rows": []
        },
        "message": "操作成功",
        "state": 1
    })
});
router.get('/chat-test/getMessages.json', function(req, res, next) {
    res.send({
        "content": {
            "rows": [{
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "97618794797858818",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "gogogo",
                    "createTime": "1489544598000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "97592184466046978",
                    "msgType": 2,
                    "msgStatus": 0,
                    "msgContent": "{\"picUrl\":\"\",\"hdPicUrl\":\"https://www.lgstatic.com/i/image/M00/B9/36/Cgp3O1jCc3yAIDtuAACM0IjpnuU878.png\",\"thumbUrl\":\"https://www.lgstatic.com/i/image/M00/B9/36/CgqKkVjCc3yAHoqYAAC10GOOC44988.png\",\"picSize\":\"36041\",\"key\":\"0000000100636257\",\"md5\":\"e9449173de142054a7918a6ff28165fe\",\"isEncrypt\":true,\"thumbWidth\":235,\"thumbHeight\":151}",
                    "createTime": "1489138556000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97580729097781266",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "当前不再考虑新机会了，感谢您的关注。",
                    "createTime": "1488963761000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97580728090951696",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "😡",
                    "createTime": "1488963746000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "97580725724446727",
                    "msgType": 3,
                    "msgStatus": 0,
                    "msgContent": "{\"voiceUrl\":\"https:\/\/www.lgstatic.com\/a\/audio1\/M00\/00\/58\/CgpyFli_yH6AXLQ-AAANcF7hHAc811.amr\",\"voiceLength\":2,\"key\":\"0000000451564586\",\"voiceFormat\":\"amr\",\"md5\":\"506dd3b363e010bef7bb478cc94bc123\",\"isEncrypt\":true}",
                    "createTime": "1488963710000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97580724164624398",
                    "msgType": 2,
                    "msgStatus": 0,
                    "msgContent": "{\"picUrl\":\"\",\"hdPicUrl\":\"https://www.lgstatic.com/i/image/M00/B6/DA/Cgp3O1i_yGaAQNkzAAKUcCItxE0385.png\",\"thumbUrl\":\"https://www.lgstatic.com/i/image/M00/B6/DA/CgqKkVi_yGaACL84AAFbACuRssw187.png\",\"picSize\":\"169069\",\"key\":\"0000000216857935\",\"md5\":\"08a3f12787f5c14ab8f10f7e741cf71a\",\"isEncrypt\":true,\"thumbWidth\":163,\"thumbHeight\":217}",
                    "createTime": "1488963686000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "97580232357576716",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "dd",
                    "createTime": "1488956182000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97575106382725130",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "烦人",
                    "createTime": "1488877966000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97575099993227272",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "等你到家",
                    "createTime": "1488877868000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "001",
                    "msgId": "97575096717737990",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "回家多久",
                    "createTime": "1488877818000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "97575095771267076",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "好的换手机",
                    "createTime": "1488877804000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "97575017905586181",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "ddd",
                    "createTime": "1488876615000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "97574976107249666",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "ddd",
                    "createTime": "1488875978000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "97574397861363715",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "😵",
                    "createTime": "1488867154000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "97574395260174337",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "😦",
                    "createTime": "1488867115000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "377453078472471",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "嘎嘎嘎vv",
                    "createTime": "1474426087000",
                    "expireTime": "0",
                    "platform": 1,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "377300285997590",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "😲sadf",
                    "createTime": "1473829242000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4503599629109891",
                    "msgId": "376842399366933",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "😃",
                    "createTime": "1472040622000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "376842397125652",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "☺️",
                    "createTime": "1472040613000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                },
                {
                    "sessionId": "001",
                    "sessionIdV2": "0-001",
                    "senderId": "4",
                    "msgId": "376818894556179",
                    "msgType": 0,
                    "msgStatus": 0,
                    "msgContent": "xzcz",
                    "createTime": "1471948806000",
                    "expireTime": "0",
                    "platform": 2,
                    "priority": 0
                }
            ]
        },
        "message": "操作成功",
        "state": 1
    })
});

module.exports = router;