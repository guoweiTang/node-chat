const express = require('express');
//专为form表单上传文件而生
const multer  = require('multer');
let router = express.Router();
let util = require('../lib/util');
let {sessionModel, userModel} = require('../db-model');


//“我的”页面初始化
router.get('/profile.html', function(req, res, next){
    //已登录
    if(req.session.user){
        res.render('account/profile');
    }else{
        res.redirect('/auth/login.html');
    }
})

//上传头像
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/upload-sources/i')
  },
  filename: function (req, file, cb) {
    let extName = file.originalname.substr(file.originalname.lastIndexOf('.'));
    let newFileName = [file.fieldname, Date.now(), parseInt(Math.random()*Math.pow(10,5))].join('-') + extName;
    cb(null, newFileName);
  }
})
let upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if(!isAbleUploadPic(file)){
            cb(new Error('该上传文件只支持扩展名为jpg、png、gif的文件'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 4,
        files: 5
    }
});

function isAbleUploadPic(file){
    return (/^image\/(jpeg|gif|png)$/).test(file.mimetype);
}

router.post('/uploadPicture.json', function(req, res, next) {
    upload.single('headPic')(req, res, function(err){
        if(err){
            if(err.code === 'LIMIT_FILE_SIZE'){
                err.message = '上传文件不能超过5MB';
            }
            res.send({
                status: -1,
                message: err.message
            })
            return;
        }
        let serverFileName = req.file.filename;
        let serverPicturePath = '/upload-sources/i/' + serverFileName;
        res.send({
            result: {
                picture: serverPicturePath
            },
            status: 1,
            message: 'success'
        })
    })
})


//更新个人信息
router.route('/uploadProfile.json')
.post(function(req, res, next){
    let user = req.session.user;
    user.picture = req.body.headPic;
    user.name = req.body.user;

    userModel.findOneAndUpdate({
        id: user.id
    },{
        name: user.name,
        picture: user.picture
    }, function(err, data) {
        if(err) throw err;
        res.send({
            status: 1,
            message: 'success'
        })
    })
    sessionModel.updateMany({
        "sessionId": RegExp('^\\d+-' + user.id + '$')
    }, {
        "sessionIcon": user.picture,
        "sessionName": user.name
    }, function(err, session) {
        if(err)throw err;
    })

})

module.exports = router;
