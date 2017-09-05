/**
 * html渲染函数
 * @author ice@lagou.com
 */

define(function(require, exports, module) {
    "use strict";
    var LGChat = require('/common/components/node-chat/api');

    var $msgContainer = $('.msg_content'),
        $mainMsgContent = $('.main_content'),
        //滚动至消息底部的定时器
        scrollBottomTimer = null;
    //更新会话列表
    function renderAddSession(list) {
        var html = '',
            activeIndex = LGChat.getActiveIndex(),
            topIndex = LGChat.getTopSessionList().length;
        if (list instanceof Array) {
            list.forEach(function(item) {
                html += renderSession(item);
            })
            $('.people_list').append(html);
        } else {
            html = renderSession(list);
            //存在置顶会话
            if (topIndex > 0) {
                $('.people_list .dialog').eq(topIndex - 1).after($(html));
            } else {
                $('.people_list').prepend(html);
            }
            if (activeIndex >= 0) {
                $('.people_list .dialog').eq(activeIndex).addClass('active').siblings().removeClass('active');
            }
        }
    }

    function renderSession(session) {
        var unread_html;
        var now = new Date();
        var date = new Date(session.lastMsg.createTime);
        if (!session.unreadCount) {
            unread_html = '<i class="unread_count dn">0</i>';
        } else if (session.unreadCount < 99) {
            unread_html = '<i class="unread_count">' + session.unreadCount + '</i>';
        } else {
            unread_html = '<i class="unread_count more">99</i>'
        }


        return ['<dl class="dialog" data-session-id="' + session.sessionId + '">',
            '    <dt>',
            '        <img width="38" height="38" src="' + session.sessionIcon + '">',
            unread_html,
            '    </dt>',
            '    <dd>',
            '        <span class="time">' + getSessionDateText(date) + '</span>',
            '        <h4>' + session.sessionName + '</h4>',
            session.lastMsg ? '        <p class="msg">' + session.lastMsg.msgContent + '</p>' : '',
            '        <i class="delete-icon" alt="删除">X</i>',
            '    </dd>',
            '</dl>',
        ].join("");
    }

    //获取消息时间
    function getSessionDateText(date) {
        var firstText = '';
        var lastText = [add0(date.getHours()), add0(date.getMinutes()), add0(date.getSeconds())].join(':');
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        var _date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if(now.getTime() == _date.getTime()){
            return lastText;
        }else if(now.getTime() == _date.getTime() + 1000*60*60*24){
            firstText = '1天前';
        }else{
            firstText = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/');
        }
        return [firstText, lastText].join(' ');
    }

    //更新未读状态
    function renderUnread(sessionId) {
        var sessionIndex = LGChat.getIndexBySessionId(sessionId),
            session = LGChat.getAllSession()[sessionIndex];
        var $unreadDom = $('.people_list .dialog').eq(sessionIndex).find('.unread_count');
        if (session.unreadCount === 0) {
            $unreadDom.addClass('dn').html(0);
        } else if (session.unreadCount > 99) {
            $unreadDom.removeClass('dn').addClass('more').html(99);
        } else {
            $unreadDom.removeClass('dn').removeClass('more').html(session.unreadCount);
        }
    }

    //更新消息列表
    function renderAddMessages(sessionId, list) {
        var html = '',
            activeIndex = LGChat.getActiveIndex(),
            allSession = LGChat.getAllSession(),
            sessionIndex = LGChat.getIndexBySessionId(sessionId),
            lastMsg;
        if (list instanceof Array) {
            //滚动条滚至底部
            scrollToBottom('list');
            //更新未读
            renderUnread(sessionId);

            list.forEach(function(item, index) {
                if(!index){
                    html += renderMessage(item);
                }else{
                    html += renderMessage(item, lastMsg);
                }
                lastMsg = item;
            })

            $mainMsgContent.html(html);
        } else {
            //滚动条滚至底部
            scrollToBottom('item');

            var message = LGChat.getMessageBySessionId(sessionId);
            if(message.length > 1){
                html = renderMessage(list, message[message.length - 2]);
            }else{
                html = renderMessage(list);
            }
            $mainMsgContent.append(html);
        }


        $('.category_title a').html(allSession[sessionIndex].sessionName);
        $('.people_list .dialog').eq(activeIndex).addClass('active').siblings().removeClass('active');
    }

    /**
     * [scrollToBottom 滚动条调至底部]
     * @param  {[String]} type [list, item]
     * @return {[type]}      [description]
     *
     * tips：由于需要获取新容器的高度，所以用了延时，鸡肋实现，这里有bug~~~放心，我不会留下联系方式
     */
    function scrollToBottom(type) {

        var containerHeight = $msgContainer.outerHeight(),
            oldMsgHeight = $mainMsgContent.outerHeight(),
            newMsgHeight,
            step = 0;
        if(type === 'list'){
            $mainMsgContent.addClass('dn');
        }
        (function goBottom() {
            clearTimeout(scrollBottomTimer);
            scrollBottomTimer = setTimeout(function() {
                step++;
                newMsgHeight = $mainMsgContent.outerHeight();
                if (newMsgHeight !== oldMsgHeight || step > 3) {
                    // console.log(step, newMsgHeight);
                    if(type === 'list'){
                        $mainMsgContent.removeClass('dn');
                    }
                    var offsetTop = newMsgHeight - containerHeight;
                    if (offsetTop > 0) {
                        $msgContainer.scrollTop(offsetTop + 100);
                    }
                } else {
                    return goBottom();
                }
            }, 60);
        })();


    }

    function renderMessage(msg, prevMsg) {
        var isMyself = msg.senderId == $('#USERID').val(),
            activeIndex = LGChat.getActiveIndex(),
            icon = LGChat.getAllSession()[activeIndex].sessionIcon;
        if (msg.msgType === 0) {
            // console.log('开始普通消息')

            msg.renderContent = msg.msgContent;

        } else if (msg.msgType === 2) {
            // console.log('开始渲染图片消息')

            msg.renderContent = '<img class="thumb_picture" src="' + msg.msgContent.thumbUrl + '" width="' + msg.msgContent.thumbWidth + '" height="' + msg.msgContent.thumbHeight + '" style="margin: 6px 0;">';

        } else if (msg.msgType === 3) {
            // console.log('开始渲染语音消息')
            var spaceWidth = msg.msgContent.voiceLength,
                spaceHtml = '<span class="space" style="width:' + (spaceWidth > 50 ? 200 : spaceWidth * 4) + 'px"></span>';
            msg.renderContent = (isMyself ? spaceHtml : '') + '<i class="audio-icon"></i>' + (isMyself ? '' : spaceHtml) + '<span class="time">' + spaceWidth + '"</span><audio src="' + msg.msgContent.voiceUrl + '">该浏览器版本不支持语音播放，请下载APP播放或切换chrome等现代浏览器播放</audio>';

        } else if (msg.msgType !== 1) {
            // console.log('开始渲染其他类型消息')
        }

        //时间显示条
        var theRenderMsgCreateTime = formatMsgDate(msg.createTime, prevMsg ? prevMsg.createTime : '');
        var msgTimebarHtml = theRenderMsgCreateTime ? '<div class="time_line"><span class="line"></span><span class="time">' + theRenderMsgCreateTime + '</span><span class="line"></span></div>' : '';
        
        return [msgTimebarHtml,
            '<dl class="session_bubble' + (isMyself ? ' myself' : '') + '">',
            '    <dt>',
            '        <a target="_blank" href="/user/2.html"> <img width="38" height="38" src="' + (isMyself ? $('#USERPIC').val() : icon) + '" /> </a>',
            '    </dt>',
            '    <dd>',
            '        <span class="arrow"></span>',
            '        <pre>' + msg.renderContent + '</pre>',
            '    </dd>',
            '</dl>',
        ].join("");
    }

    //删除会话
    function deleteSession(sessionId, oldIndex) {
        console.log('删除会话');
        $('.people_list .dialog').eq(oldIndex).remove();
        var activeIndex = LGChat.getActiveIndex();
        if (activeIndex > oldIndex) {
            $('.people_list .dialog').eq(activeIndex).addClass('active').siblings().removeClass('active');
        }
        $('.no_msg').removeClass('dn');
        $('.had_msg').addClass('dn');
    }
    //置顶会话
    function goTopSession(sessionId, oldIndex) {
        console.log('置顶会话');
        $('.people_list .dialog').eq(oldIndex).remove().prependTo($('.people_list'));
        var activeIndex = LGChat.getActiveIndex();
        if (activeIndex >= 0) {
            $('.people_list .dialog').eq(activeIndex).addClass('active').siblings().removeClass('active');
        }
    }

    //语音播放
    $mainMsgContent.on('click', '.session_bubble', function() {
        var audio = $(this).find('audio')[0];
        if (audio) {
            if (audio.paused) {
                $('.main_content audio').each(function() {
                    audio.currentTime = 0;
                    audio.pause();
                })
                audio.play();
            } else {
                audio.currentTime = 0;
                audio.pause();
            }
            audio.onpause = audio.onended = function() {
                $(this).parents('.session_bubble').children('dd').removeClass('playing');
            }
            audio.onplay = function() {
                $(this).parents('.session_bubble').children('dd').addClass('playing');
            }
        }
    });

    /**
     * [formatMsgDate 格式化显示时间格式]
     * @param  {[type]} currentDate [当前时间对象字符串]
     * @param  {[type]} prevDate    [上个时间对象字符串]
     * @return {[String]}             [时间字符串]
     */
    function formatMsgDate(currentDate, prevDate){
        var current = new Date(currentDate),
            current_date = current.getDate(),
            current_year = current.getFullYear(),
            current_month = current.getMonth() + 1,
            current_time = current.toString().split(' ')[4],
            current_date_num_arr = [current_year, add0(current_month), add0(current_date)];

        if(prevDate){
            var now = new Date(),
                now_date = now.getDate(),
                now_year = now.getFullYear(),
                now_month = now.getMonth() + 1,
                now_date_num_arr = [now_year, add0(now_month), add0(now_date)];

            var prev = new Date(prevDate),
                prev_date = prev.getDate(),
                prev_year = prev.getFullYear(),
                prev_month = prev.getMonth() + 1,
                prev_date_num_arr = [prev_year, add0(prev_month), add0(prev_date)];

            //与上条数据时间间隔大于5min、与上条数据不是同一天显示
            if(current.getTime() - prev.getTime() > 5 * 60 * 1000 || parseInt(current_date_num_arr.join('')) != parseInt(prev_date_num_arr.join(''))){
                if(parseInt(current_date_num_arr.join('')) == parseInt(now_date_num_arr.join(''))){
                    return current_time;
                }else{
                    return current_date_num_arr.join('-') + ' ' + current_time;
                }
            }
        }else{
            return current_date_num_arr.join('-') + ' ' + current_time;
        }

    }
    function add0(num){
        return num < 10 ? '0' + num : num;
    }
    module.exports = {
        'deleteSession': deleteSession,
        'renderAddSession': renderAddSession,
        'renderAddMessages': renderAddMessages,
        'renderUnread': renderUnread
    }

});
