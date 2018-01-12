/**
 * 监听socket连接
 */

const sio = require('socket.io');
module.exports = function(server) {
    const io = sio.listen(server);
    //所有已建立聊天通信用户的套接字仓库
    const allSockets = new Map();

    io.sockets.on('connection', function(socket) {

        // 设置套接字(包括登录用户信息)，socket.handshake包括请求头的一系列信息（https://socket.io/docs/server-api/#socket-handshake）
        let connectionQuery = socket.handshake.query;
        if(!connectionQuery)return;

        allSockets.set(connectionQuery.id, socket);

        socket.on('message', function(data, fn) {
            fn(+ new Date());

            let theSessionId = data.content.sessionId;
            //发送普通聊天消息
            if(data.type === 'IM_SEND_MESSAGE'){
                let tempSesssionIdArr = theSessionId.split('-').reverse();
                data.content.sessionId = tempSesssionIdArr.join('-')
                //如果对方在线，把消息推送给对方
                let othersId = tempSesssionIdArr[0];
                if(allSockets.get(othersId)){
                    allSockets.get(othersId).emit('message', data);
                }
            //状态消息
            }else if(data.type === 'IM_SESSION_UPDATE'){
                // socket.emit('message', data);
            }
        })
        socket.emit('connect');
    })
}




