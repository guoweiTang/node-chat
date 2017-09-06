//umd规范
define(function(require, exports, module) {
    "use strict";
    var LGUtils = require('/common/components/util/util'),
        sio = require('/node_modules/socket.io-client/dist/socket.io'),
        emojiUtil = require('./emoji/emoji');
    var config = {
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
        delSessionById: delSessionById,
        addMessages: addMessages,
        addListAndMessages: addListAndMessages,
        getAllSession: getAllSession,
        getActiveIndex: getActiveIndex,
        getIndexBySessionId: getIndexBySessionId,
        getMessageBySessionId: getMessageBySessionId,
        getTopSessionList: getTopSessionList
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
        var socket = sio.connect.apply(sio, arguments);
        socket.on('connect', function() {
            result.trigger('connect');

            socket.on('message', function(data) {
                var firstType = data.type,
                    firstContent = data.content,
                    oldIndex,
                    sessionId = firstContent.sessionId;
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
                        result.trigger('FE_SESSION_UPDATE', firstContent);
                        // //删除
                        // if(parseInt(firstContent.status) === 1){
                        //     oldIndex = delSessionById(sessionId);
                        //     result.trigger('FE_SESSION_DEL', firstContent, oldIndex);
                        // //置顶
                        // }else if(parseInt(firstContent.status) === 2){
                        //     oldIndex = goTopSessionById(sessionId);
                        //     result.trigger('FE_SESSION_TOP', firstContent, oldIndex);
                        // }
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
     * [delSessionById 删除会话，依次更新：会话列表，会话序列，消息列表]
     * @param  {[String]} id [会话id]
     * @return {[Number]} sessionIndex [原会话索引]
     */
    function delSessionById(id){
        var sessionIndex = config.sessionMap[id],
            inTopSessionIndex = config.topSessionList.indexOf(id);
        config.sessionList.splice(sessionIndex, 1);
        if(inTopSessionIndex > -1){
            config.topSessionList.splice(inTopSessionIndex, 1);
        }
        //更新活跃会话位置
        if(config.activeIndex > -1 && config.activeIndex > sessionIndex) {
            config.activeIndex --;
        }else if(config.activeIndex === sessionIndex){
            config.activeIndex = -1;
        }
        updateSessionMap();
        delete config.messages[id];
        return sessionIndex;
    }
    /**
     * [goTopSession 置顶会话，更新顺序同“删除会话”]
     * @param  {[Object]} msg [收到的消息对象内容]
     * @return {[Number]} sessionIndex [更新前的索引]
     */
    function goTopSessionById(sessionId){
        var sessionIndex = config.sessionMap(sessionId),
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
        var oldIndex = addMsgToSessionList(msg);
        addMsgToMessages(msg);
        return oldIndex;
    }

    /******更新会话列表******/
    //如果已存在会话，更新会话；不存在，查询更新
    function addMsgToSessionList(msg) {
        var oldIndex = config.sessionMap[msg.sessionId],
            tempSession,
            topIndex = config.topSessionList.length,
            activeIndex = config.activeIndex;
        //不存在会话
        if(typeof oldIndex === 'undefined'){
            result.trigger('ADD_NEW_SESSION', msg);

            //若存在非置顶活跃会话，则更新活跃会话索引
            if(activeIndex >= topIndex) {
                activeIndex ++;
            }
        //存在会话
        }else{
            tempSession = config.sessionList[oldIndex];
            tempSession.lastMsg = msg;
            //更新未读数
            if(activeIndex > -1 && activeIndex === oldIndex){
                tempSession.unreadCount = 0;
            }else{
                tempSession.unreadCount ++;
            }

            //非置顶会话需要更新会话位置以及活跃会话索引
            if(tempSession.status !== 2){
                tempSession = config.sessionList.splice(oldIndex, 1)[0];
                config.sessionList.splice(topIndex, 0, tempSession);
                
                //更新活跃会话索引
                if(activeIndex > -1) {
                    //当前会话
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
    function addMsgToMessages(msg) {
        var message = getMessageBySessionId(msg.sessionId);
        if(message){
            message.push(msg);
        }
    }

    /*****格式化消息*****/
    function parseMessage(msg){
        switch(msg.msgType) {
            case 0:
                msg.msgContent = emojiUtil.getImageByString(msg.msgContent);
                // console.log('普通消息');
                break;
            case 1:
                msg.msgContent = '图文混合消息';
                break;
            case 2:
                msg.msgContent = '图片消息';
                // console.log('图片消息');
                break;
            case 3:
                msg.msgContent = '音频消息';
                // console.log('音频消息');
                break;
            default:
                msg.msgContent = '未知消息类型';
        }
    }
    /**
     * 设置会话列表（更新会话）
     * @param {[Array|Object]} session [会话数组|单个会话]
     */
    function addSessionList(session) {

        var sessionList,
            topIndex = getTopSessionList().length;
        //如果数据类型为数组添加至列表底部，如果是普通对象前置“置顶会话”以下
        if(session instanceof Array){
            config.sessionList = Array.prototype.concat(config.sessionList, session);

            //更新序列表&&置顶会话列表
            updateSessionMap(function(theItem, index) {
                //status{0:正常状态, 1:已删除, 2:已置顶}
                if(theItem.status === 2){
                    config.topSessionList.push(theItem.sessionId);
                }
            });
        }else{
            config.sessionList.splice(topIndex, 0, session);
            updateSessionMap();
        }
    }

    /**
     * 设置消息详情（缓存数据中）
     * @param {[String]} sessionId [会话id]
     * @param {[Array]} arr       [消息数组（可选）]
     */
    function addMessages(sessionId, arr){
        var message = result.getMessageBySessionId(sessionId);

        //存在要增加的消息数据
        if(arr instanceof Array){
            arr.forEach(function(item) {
                parseMessage(item);
            })
            config.messages[sessionId] = arr;
        //缓存数据中不存在该会话的消息并且没有要增加进来的数据，则查询后设置
        }else if(!message){
            result.trigger('ADD_NEW_MESSAGE', sessionId);
            return;
        }
        //更新活跃会话索引
        config.activeIndex = getIndexBySessionId(sessionId);
        
        //更新未读数
        config.sessionList[config.activeIndex].unreadCount = 0;
    }
    //设置会话序列MAP
    function updateSessionMap(cb){
        if(!config.sessionList.length){
            config.sessionMap = {};
        }
        config.sessionList.forEach(function(theItem, index) {
            config.sessionMap[theItem.sessionId] = index;
            typeof cb === 'function' && (cb(theItem, index));
        })
    }


    return result;
})
