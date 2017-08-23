let express = require('express');
let router = express.Router();
let util = require('./util');
//专为form表单上传文件而生（https://github.com/expressjs/multer）
let multer  = require('multer');
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
    "sessionName": String
});
let userModel = db.model('users', userSchema);
let sessionModel = db.model('sessions', sessionSchema);

//“我的”页面初始化
router.route('/profile.html')
.get(function(req, res, next){
    //已登录
    if(req.session.user){
        res.render('account/profile');
    }else{
        res.redirect('/login.html');
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
    storage: storage,
    fileFilter: function (req, file, cb) {
        if(!isAbleUploadPic(file)){
            cb(new Error('该上传文件只支持扩展名为jpg、png、gif的文件'));
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 4,
        files: 1
    }
});
function isAbleUploadPic(file){
    return (/^image\/(jpeg|gif|png)$/).test(file.mimetype);
}

router.post('/account/uploadPicture.json', function(req, res, next) {
    console.log(0);
    upload.single('headPic')(req, res, function(err){
        console.log(1);
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
router.route('/account/uploadProfile.json')
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
