/**
 * @author ice@lagou.com
 */

define(function(require, exports, module) {

    var LGChat = require('/common/components/node-chat/api'),
        render = require('./render');
    window.LGChat = LGChat;

    //建立连接
    var socket = LGChat.connect({
        reconnectionAttempts: 5,
        query: {
            name: $('#USERNAME').val(),
            picture: $('#USERPIC').val(),
            id: $('#USERID').val()
        }
    });
    //绑定事件
    LGChat.on('connect', function() {
        console.log('connected');
    });
    LGChat.on('disconnect', function() {
        console.log('disconnect');
    });
    LGChat.on('reconnect', function() {
        console.log('reconnect');
    });
    LGChat.on('message', function(msg) {
        console.log('原始消息如下↓');
        console.log(msg);
    });


    LGChat.on('FE_SESSION_DEL', function(sessionId, oldIndex) {
        render.deleteSession(sessionId, oldIndex);
    })
    LGChat.on('FE_SESSION_TOP', function(sessionId, oldIndex) {
        render.goTopSession(sessionId);
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
        if(newIndex >= 0 && newIndex === activeIndex){
            render.renderAddMessages(msg.sessionId, msg);
            askReaded(msg.sessionId);
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
                var res = data.content;
                if(data.state === 1 && res){
                    LGChat.addSessionList(res);
                   // render.renderAddSession(res);
                }
            }
        })
    });
    addSessionList(1);


    //获取会话列表
    function addSessionList(page){
        $.ajax({
            url: '/chat-test/getSessionList.json',
            data: {
                page: page
            },
            success: function(data) {
                var sessionList = data.content;
                if (data.state === 1) {
                    LGChat.addSessionList(sessionList);
                    //html渲染
                    render.renderAddSession(sessionList);
                }
            }
        })
    }

    //获取会话详情（首次加载该会话详情会调用）
    LGChat.on('ADD_NEW_MESSAGE', function(sessionId){
        $.ajax({
            url: '/chat-test/getMessages.json',
            data: {
                sessionId: sessionId
            },
            async: false,
            success: function(data) {
                // console.log(data);
                var msg = data.content;
                if (data.state === 1 && msg) {
                    LGChat.addMessages(sessionId, msg);
                    //html渲染
                    render.renderAddMessages(sessionId, msg);
                }
            }
        })
    })

    //标记已读
    function askReaded(sessionId){
        $.ajax({
            url: '/chat-test/readed.json',
            data: {
                sessionId: sessionId
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
        var prevActiveIndex = LGChat.getActiveIndex(),
            sessionId = $(this).data('session-id');
        if($(this).index() !== prevActiveIndex){
            LGChat.setMessages(sessionId);

            //标记已读
            askReaded(sessionId);
        }
        if(!$('.no_msg').hasClass('dn')){
            $('.no_msg').addClass('dn');
            $('.had_msg').removeClass('dn');
        }
    })
    $('.people_list').on('click', '.delete-icon', function(e) {
        var sessionId = $(this).parents('.dialog').data('session-id');
        $.ajax({
            url: '/chat-test/updateSession.json',
            data: {
                status: 1,
                sessionId: sessionId
            },
            success: function(data) {
                if(data.state == 1){
                    socket.emit('message', data.content, function(dateStr) {
                        console.log('UPDATE OK!')
                    });
                }else{
                    console.log('UPDATE ERROR!')
                }
            },
            error: function(err) {
                console.log('UPDATE ERROR!');
            }
        })
    })

    //发送消息
    $('form').on('submit', function(event) {
        var msg = LGChat.emojiUtil.getStringByImage($('#text_area').html());
        var content = {
            "sessionId":LGChat.getAllSession()[LGChat.getActiveIndex()].sessionId,
            "msgType":0,
            "senderId": $('#USERID').val(),
            "msgContent":msg,
            "createTime": new Date()
        }

        $.ajax({
            url: '/chat-test/sendMsg.json',
            data: content,
            success: function(data) {
                if(data.state == 1){
                    socket.emit('message', data.content, function(dateStr) {
                        console.log('SEND OK!')
                    });
                }else{
                    console.log('SEND ERROR!')
                }
            },
            error: function(err) {
                console.log('SEND ERROR!');
            }
        })

        //手动推送消息
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
