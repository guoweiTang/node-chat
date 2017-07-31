/**
 * @author ice@lagou.com
 */

define(function(require, exports, module) {

    var LGChat = require('/common/components/node-chat/api'),
        render = require('./render');
    // window.emoji = require('../components/lagou-chat/emoji/emoji.js');
    window.LGChat = LGChat;
    // window.render = render;

    //建立连接
    // LGChat.connect('https://easypush.lagou.com/push', {
    //     "path": '/push', // (String) 服务器端捕获的名称 (/socket.io)
    //     "force new connection": true, // (Boolean) 是否强制创建新的连接实例   
    //     "reconnectionDelay": 2000, // (Number) 重连间隔 (1000)
    //     "timeout": 10000, // (Number) 超时时间 (20000)
    //     "query": {
    //         "uri": window.location.pathname
    //     } // (Object) 参数
    // })
    //绑定事件
    // LGChat.on('connect', function() {
    //     console.log('connected');
    // });
    // LGChat.on('disconnect', function() {
    //     console.log('disconnect');
    // });
    // LGChat.on('reconnect', function() {
    //     console.log('reconnect');
    // });
    // LGChat.on('message', function(msg) {
    //     console.log(msg);
    // });


    LGChat.on('FE_SESSION_UPDATE', function(msg, oldIndex) {
        if(typeof oldIndex !== 'undefined'){
            switch(parseInt(msg.status)){
                //删除
                case 0x80:
                    render.deleteSession(msg.sessionId, oldIndex);
                    break;
                //置顶
                case 0x10:
                    render.goTopSession(msg.sessionId);
                    break;
            }
        }
    })
    LGChat.on('FE_DEFAULT_MESSAGE', function(msg, oldIndex) {
        var sessionList = LGChat.getAllSession(),
            newIndex = LGChat.getIndexBySessionId(msg.sessionId);
            activeIndex = LGChat.getActiveIndex();
        //更新会话列表
        if(typeof oldIndex !== 'undefined'){
            $('.people_list .dialog').eq(oldIndex).remove();
        }
        render.renderAddSession(sessionList[newIndex]);

        //更新消息，推送的消息是当前活跃会话，更新消息（html渲染）
        if(newIndex === activeIndex){
            render.renderAddMessages(msg.sessionId, msg);
        }
    });
    //查询其中一个会话（特别注意：这一块儿要用同步请求获取新的会话内容）
    LGChat.on('ADD_NEW_SESSION', function(msg) {
        $.ajax({
            url: '/chat-test/getSessionList.json',
            data: {
                sessionId: msg.sessionId
            },
            async: false,
            success: function(data) {
                var res = getTheNewSession();
                // var res = data.content.rows;
                if(data.state === 1 && res){
                   LGChat.addSessionList(res[0]);
                }
            }
        })
    });
    function getTheNewSession() {
        //查询与张欣会话
        return {
            "sessionType": 0,
            "sessionId": "003",
            "sessionIdV2": "0-003",
            "status": 0,
            "updateTime": "1484399709000",
            "version": "4",
            "statusVersion": "1",
            "unreadCount": 1,
            "name": "张欣 · 项目经理",
            "icon": "i/image/M00/6F/6D/Cgp3O1gkJb-AEm1DAABHjz4hdm895.jpeg",
            "attachment": "{\"cUserId\":300,\"recommend\":false,\"portrait\":\"i/image/M00/6F/6D/Cgp3O1gkJb-AEm1DAABHjz4hdm895.jpeg\",\"nickName\":\"张欣\",\"realName\":\"张欣\",\"resumeStage\":\"\",\"lastPositionName\":\"项目经理\",\"version\":1,\"positionId\":\"2391998\",\"positionName\":\"项目经理\"}",
            "userRole": "NORMAL",
            "lastReadMsgId": "97275721094135809",
            "lastReceivedMsgId": "97275721094135809",
            "rivalReadMsgId": "0",
            "firstMsgId": "0",
            "lastMsg": {
                "sessionId": "003",
                "sessionIdV2": "0-003",
                "senderId": "003",
                "msgId": "97275721094135809",
                "msgType": 0,
                "msgStatus": 0,
                "msgContent": "Hi，我是张欣，我有5年工作经验，正在国电通网络技术有限公司任职项目经理。 我对您发布的这个职位很感兴趣，期待能进一步沟通。",
                "createTime": "1484399709000",
                "expireTime": "0",
                "platform": 0,
                "priority": 0
            },
            "rivalStatus": 0
        };
    }
    addSessionList(1);
    //获取会话列表
    function addSessionList(page){
        (function(thePage) {
            $.ajax({
                url: '/chat-test/getSessionList.json',
                data: {
                    page: thePage,
                    pageSize: 10
                },
                success: function(data) {
                    var res = data.content.rows;
                    if (data.state === 1 && res) {
                        LGChat.addSessionList(res);
                        //html渲染
                        render.renderAddSession(res);
                    }
                }
            })
        })(page);
    }

    //获取会话详情
    function setMessages(id) {
        LGChat.setMessages(id);
        var message = LGChat.getMessageBySessionId(id);
        //html渲染
        render.renderAddMessages(id, message);
    }
    LGChat.on('ADD_NEW_MESSAGE', addMessageBySessionId);
    function addMessageBySessionId(sessionId){
        $.ajax({
            url: '/chat-test/getMessages.json',
            data: {
                sessionId: sessionId
            },
            async: false,
            success: function(data) {
                // console.log(data);
                var res = data.content.rows;
                if (data.state === 1 && res) {
                    LGChat.addMessages(sessionId, res);
                }
            }
        })
    }


    //默认表情初始化
    (function() {
        var defaultEmojiHtml = '';
        LGChat.emojiUtil.getDefaultEmojies().forEach(function(theItem, index){
            defaultEmojiHtml += '<img class="emoji" src="' + theItem.src + '" data-emoji-code="' + theItem.code + '" />'
        })
        $('.emoji_content').append(defaultEmojiHtml);
    })();
    

    /***********************事件绑定***********************/
    //切换会话
    $('.people_list').on('click', '.dialog', function() {
        var index = $(this).index(),
            prevActiveIndex = LGChat.getActiveIndex();
        if(index !== prevActiveIndex){
            setMessages(LGChat.getAllSession()[index].sessionId);
        }
        if(!$('.no_msg').hasClass('dn')){
            $('.no_msg').addClass('dn');
            $('.had_msg').removeClass('dn');
            $('#text_area').focus();
        }
    })
    $('.people_list').on('click', '.delete-icon', function() {
        console.log('删除会话')
        return false;
    })

    //发送消息
    $('form').on('submit', function(event) {
        var msg = LGChat.emojiUtil.getStringByImage($('#text_area').html());
        var content = {
            "sessionId":LGChat.getAllSession()[LGChat.getActiveIndex()].sessionId,
            "msgType":0,
            "senderId":"4",
            "msgId": '' + Math.random(),
            "msgContent":msg,
            "createTime": +new Date()
        }

        //手动推送消息
        console.log(content);
        var oldIndex = LGChat.addListAndMessages(content);
        LGChat.trigger('FE_DEFAULT_MESSAGE', content, oldIndex);

        $('#text_area').html('');
        event.preventDefault();
        return false;
    })
    $('#text_area').on('keydown', function(event){
        if(event.keyCode === 13){
            $('form').submit();
            event.preventDefault();
        };
    });
    //加入表情
    $(document).on('click', '.icon-emoji', function() {
        $('.emoji_content').toggleClass('dn')
        return false;
    })
    $(document).on('click', function(event) {
        var target = $(event.target);
        if(!target.hasClass('emoji_content')){
            $('.emoji_content').addClass('dn');
        }
    })
    $('.emoji_content').on('click', '.emoji', function() {
        var oldHtml = $('#text_area').html(),
            emojiIcon = LGChat.emojiUtil.getImageByCodePoint($(this).data('emoji-code'));
        $('#text_area').html(oldHtml + emojiIcon);
        $('.emoji_content').addClass('dn');
        return false;
    })

});
