const express = require('express');
const router = express.Router();
const util = require('../lib/util');
const config = require('../lib/config');
const {userModel} = require('../db-model');

//注册
router.get('/register.html', function(req, res, next){
    res.render('passport/register');
});
router.post('/register.json', function(req, res, next){
    res.set('Content-Type', 'text/html');
    let body = req.body;
    let message;

    if(!body.user || !body.password || !body.repassword){
        message = '表单不能为空';
    }else{
        if(body.password !== body.repassword){
            message = '两次输入密码不一致';
        }
    }
    if(message){
        res.send({
            status: -1,
            message: message
        })
        return;
    }
    //检测该用户名是否已注册
    userModel.findOne({
        name: body.user
    }, function(err, baseUser){
        if(err){
            throw err;
            return;
        }
        if(!!baseUser){
            res.send({
                status: -1,
                message: '该用户名已注册'
            })
        }else{
            let userSource = {
                id: util.createFactoryId(),
                name: body.user,
                password: body.password
            };
            userModel.create(userSource, function(err, data) {
                if(err){
                    throw err;
                    return;
                }
                req.session.user = data;
                res.send({
                    status: 1,
                    message: 'success',
                    result: {
                        url: config.pathPrefix.index
                    }
                })
            })
        }
    })
})

//登录
router.get('/login.html', function(req, res, next){
    //已登录
    if(req.session.user){
        res.redirect(config.pathPrefix.index);
    }else{
        res.render('passport/login');
    }
})
router.post('/login.json', function(req, res, next){
    res.set('Content-Type', 'text/html');
    let body = req.body;
    let message;

    if(!body.user || !body.password){
        res.send({
            status: -1,
            message: '表单不能为空'
        })
        return;
    }
    userModel.findOne({
        name: body.user,
        password: body.password
    }, function(err, data) {
        if(err){
            throw err;
        }
        if(!data){
            res.send({
                status: -1,
                message: '帐号或密码错误'
            })
        }else{
            req.session.user = data;
            res.send({
                status: 1,
                message: 'success',
                result: {
                    url: config.pathPrefix.index
                }
            })
        }
    })
})
//登出
router.get('/logout', function(req, res, next) {
    req.session = null;
    res.redirect(config.pathPrefix.auth + '/login.html');
    // res.redirect(req.get('Referer'));
})

module.exports = router;
