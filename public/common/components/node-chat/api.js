//umd规范
define(function(require, exports, module) {
    "use strict";
    var LGUtils = require('/common/components/util/util'),
        sio = require('/node_modules/socket.io-client/dist/socket.io'),
        emojiUtil = require('./emoji/emoji');
    var config = {
        resourceUrl: 'https://appstatic.lagou.com/resource/imResource/',
        activeIndex: -1,
        //置顶会话
        topSessionList: [],
        //会话列表
        sessionList: [],
        sessionMap: {},
        //会话消息map
        messages: {}
    }
    // 该程序执行结果
    var result = {
        emojiUtil: emojiUtil,
        on: bindEvents,
        off: removeEvents,
        trigger: triggerEvents,
        connect: connect,
        addSessionList: addSessionList,
        addMessages: addMessages,
        setMessages: setMessages,
        getAllSession: getAllSession,
        getActiveIndex: getActiveIndex,
        getIndexBySessionId: getIndexBySessionId,
        getMessageBySessionId: getMessageBySessionId,
        getTopSessionList: getTopSessionList,
        addListAndMessages: addListAndMessages
    };
    /******获取数据******/
    function getAllSession() {
        return config.sessionList;
    }
    function getActiveIndex() {
        return config.activeIndex;
    }
    function getMessageBySessionId(sessionId) {
        return config.messages[sessionId];
    }
    function getIndexBySessionId(sessionId) {
        return config.sessionMap[sessionId];
    }
    function getTopSessionList() {
        return config.topSessionList;
    }

    //管理自定义事件的实例对象
    var eventsInstance = LGUtils.createEventsInstance();

    function bindEvents() {
        this.on.apply(eventsInstance, arguments);
    }

    function removeEvents() {
        this.off.apply(eventsInstance, arguments);
    }

    function triggerEvents() {
        this.trigger.apply(eventsInstance, arguments);
    }

    //连接
    function connect() {
        var socket = sio.connect();
        socket.on('connect', function() {
            socket.emit('setUser', {
                name: $('#USERNAME').val(),
                picture: $('#USERPIC').val(),
                id: $('#USERID').val()
            })
            result.trigger('connect');

            socket.on('message', function(data) {
                var firstType = data.type,
                    firstContent = JSON.parse(data.content),
                    oldIndex;
                //通用事件
                result.trigger('message', data);
                //事件分类处理
                switch(firstType){
                    //普通消息
                    case 'IM_SEND_MESSAGE':
                        oldIndex = addListAndMessages(firstContent);
                        result.trigger('FE_DEFAULT_MESSAGE', firstContent, oldIndex);
                        break;
                    //状态改变
                    case 'IM_SESSION_UPDATE':
                        //删除
                        if(parseInt(firstContent.status) === 0x80){
                            oldIndex = deleteSession(firstContent);
                        //置顶
                        }else if(parseInt(firstContent.status) === 0x10){
                            oldIndex = goTopSession(firstContent);
                        }
                        result.trigger('FE_SESSION_UPDATE', firstContent, oldIndex);
                        break;
                    case 'IM_MESSAGE_READ':
                        break;
                    case 'IM_UNREAD_MESSAGE_NUM':
                        break;
                    default:
                        result.trigger(firstType);
                }
            });

            socket.on('disconnect', function(event) {
                result.trigger('disconnect');
            });

            socket.on('reconnect', function(event) {
                result.trigger('reconnect');
            });
        });
        return socket;
    }
    /******更新会话状态******/
    /**
     * [deleteSession 删除会话，依次更新：会话列表，会话序列，消息列表]
     * @param  {[Object]} msg [收到的消息对象内容]
     * @return {[Number]} sessionIndex [更新前的索引]
     */
    function deleteSession(msg){
        var sessionId = msg.sessionId,
            sessionIndex = config.sessionMap(sessionId),
            inTopSessionIndex = config.topSessionList.indexOf(sessionId);
        config.sessionList.splice(sessionIndex, 1);
        if(inTopSessionIndex > -1){
            config.topSessionList.splice(inTopSessionIndex, 1);
        }
        //更新活跃会话位置
        if(config.activeIndex !== -1 && config.activeIndex > sessionIndex) {
            config.activeIndex --;
        }else if(config.activeIndex === sessionIndex){
            config.activeIndex = -1;
        }
        updateSessionMap();
        delete config.messages[sessionId];
        return sessionIndex;
    }
    /**
     * [goTopSession 置顶会话，更新顺序同“删除会话”]
     * @param  {[Object]} msg [收到的消息对象内容]
     * @return {[Number]} sessionIndex [更新前的索引]
     */
    function goTopSession(msg){
        var sessionId = msg.sessionId,
            sessionIndex = config.sessionMap(sessionId),
            tempSession = config.sessionList.splice(sessionIndex, 1);
        var activeIndex = config.activeIndex;
        config.sessionList.unshift(tempSession);
        //更新置顶会话列表
        config.topSessionList.unshift(sessionId);
        //更新活跃会话位置
        if(activeIndex !== -1 && activeIndex < sessionIndex) {
            activeIndex ++;
        }else if(activeIndex === sessionIndex){
            activeIndex = 0;
        }
        config.activeIndex = activeIndex;
        updateSessionMap();
        config.messages[sessionId] = 0;
        return sessionIndex;
    }


    /**
     * [addListAndMessages 收到消息]
     * @param  {[type]} msg [收到的消息对象]
     * @return {[number]}  oldIndex   [会话更新前在原列表中的位置，如果原列表存在该会话]
     */
    function addListAndMessages(msg){
        //消息格式化
        parseMessage(msg);
        var oldIndex = addSessionByMessage(msg);
        addMessageToMessages(msg);
        return oldIndex;
    }

    /******更新会话列表******/
    //如果已存在会话，更新会话；不存在，查询更新
    function addSessionByMessage(msg) {
        var sessionMap = config.sessionMap,
            oldIndex = sessionMap[msg.sessionId],
            tempSession,
            topIndex = config.topSessionList.length,
            activeIndex = config.activeIndex;
        if(typeof oldIndex === 'undefined'){
            result.trigger('ADD_NEW_SESSION', msg);

            //更新活跃会话索引
            if(activeIndex >= topIndex) {
                activeIndex ++;
            }
        }else{

            tempSession = config.sessionList[oldIndex];
            tempSession.updateTime = msg.createTime;
            tempSession.lastMsg = msg;
            //非置顶会话需要更新会话位置以及活跃会话索引
            if(tempSession.status !== '置顶会话'){
                tempSession = config.sessionList.splice(oldIndex, 1)[0];
                config.sessionList.splice(topIndex, 0, tempSession);
                
                //更新活跃会话索引
                if(activeIndex >= 0) {
                    //当前活跃会话收到消息
                    if(activeIndex === oldIndex) {
                        activeIndex = topIndex;
                    }else if(activeIndex < oldIndex){
                        activeIndex ++;
                    }
                }
                //更新会话序列map（不考虑有其他默认置顶会话）
                updateSessionMap();
            }

        }
        config.activeIndex = activeIndex;
        return oldIndex;
    }
    //如果缓存中存在会话详情，更新
    function addMessageToMessages(msg) {
        var messages = getMessageBySessionId(msg.sessionId),
            sessionIndex = config.sessionMap[msg.sessionId],
            session = config.sessionList[sessionIndex];
        //更新未读状态
        if(config.activeIndex === sessionIndex){
            //推送消息为当前活跃会话（标记已读）
            session.unreadCount = 0;
        }else{
            //推送消息不为当前活跃会话（未读数加一）
            session.unreadCount ++;
        }
        if(messages){
            messages.push(msg);
        }
    }

    /*****格式化消息*****/
    function parseMessage(msg){
        switch(msg.msgType) {
            case 0:
                msg.msgContent = parseTextMessage(msg.msgContent);
                // console.log('普通消息');
                break;
            case 1:
                console.log('图文混合消息');
                break;
            case 2:
                msg.msgContent = parsePictureMessage(msg.msgContent);
                // console.log('图片消息');
                break;
            case 3:
                msg.msgContent = parseVoiceMessage(msg.msgContent);
                // console.log('音频消息');
                break;
            default:
                console.log('未知消息类型');
        }
    }
    function parseTextMessage(msgContent){
        return emojiUtil.getImageByString(msgContent);
    }
    function parsePictureMessage(msgContent){
        try{
            msgContent = JSON.parse(msgContent);
            msgContent.thumbUrl = config.resourceUrl + msgContent.key + '?p=' + msgContent.thumbUrl;
            msgContent.picUrl && (msgContent.picUrl = config.resourceUrl + msgContent.key + '?p=' + msgContent.picUrl);
            msgContent.hdPicUrl && (msgContent.hdPicUrl = config.resourceUrl + msgContent.key + '?p=' + msgContent.hdPicUrl);
        }catch(err){
            console.log('图片解析出错')
        }
        return msgContent;
    }
    function parseVoiceMessage(msgContent){
        try{
            msgContent = JSON.parse(msgContent);
            msgContent.voiceUrl = config.resourceUrl + 'mp3/' + msgContent.key + '?p=' + msgContent.voiceUrl;
        }catch(err){
            console.log('语音解析出错')
        }
        return msgContent;
    }
    
    //设置会话列表
    function addSessionList(arr) {
        var sessionList,
            topIndex = getTopSessionList().length;
        //如果数据类型为数组添加至列表底部，如果是普通对象提前至“置顶会话”以下
        if(arr instanceof Array){
            sessionList = Array.prototype.concat(config.sessionList, arr);
            config.sessionList = sessionList;

            //更新序列表&&置顶会话列表
            updateSessionMap(function(theItem, index) {
                if(theItem.status === '置顶状态'){
                    config.topSessionList.push(theItem.sessionId);
                }
            });
        }else{
            config.sessionList.splice(topIndex, 0, arr);
        }
    }
    //设置会话序列MAP
    function updateSessionMap(cb){
        config.sessionList.forEach(function(theItem, index) {
            config.sessionMap[theItem.sessionId] = index;
            typeof cb === 'function' && (cb(theItem, index));
        })
    }

    //设置消息详情（缓存数据中）
    function setMessages(sessionId) {
        var message = result.getMessageBySessionId(sessionId);
        //缓存数据中不存在该会话的消息，则查询后设置
        if(message){
            addMessages(sessionId);
        }else{
            result.trigger('ADD_NEW_MESSAGE', sessionId);
        }
    }
    function addMessages(sessionId, arr){
        if(arr instanceof Array && arr.length){
            arr.forEach(function(item) {
                parseMessage(item);
            })
            config.messages[sessionId] = arr;
        }
        config.activeIndex = getIndexBySessionId(sessionId);
        
        //更新未读状态
        config.sessionList[config.activeIndex].unreadCount = 0;
    }

    return result;
})
