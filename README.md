## 使用
- [LGChat](#dix)
  - [LGChat.on](#on) 监听事件
    - connect
    - disconnect
    - reconnect
    - message
    - FE_DEFAULT_MESSAGE
    - FE_SESSION_UPDATE
    - GET_NEW_SESSION
  - [LGChat.trigger](#trigger) 触发事件(同on)
  - [LGChat.off](#off) 移除事件(同on)
  ---
  - [connect(url[, opt])](#connect)建立连接
  - [addSessionList(arr|obj)](#addSessionList) 会话列表追加数据
  - [setMessages(id[,arr])](#setMessages) 设置消息列表
  ---
  - [getAllSession](#getAllSession) 获取所有会话
  - [getActiveIndex](#getActiveIndex) 获取当前活跃会话索引
  - [getIndexBySessionId](#getIndexBySessionId) 获取指定会话索引
  - [getMessageBySessionId](#getMessageBySessionId) 获取指定消息
  - [getTopSessionList](#getTopSessionList) 获取置顶会话列表
  
  




## 特殊定制数据（字段可多不可少）

> 1、sessionList必需字段
```javascript
[
    {
        "sessionId": "1739395", 
        "updateTime": "1489544598000", 
        "unreadCount": 0, 
        "status": 0, 
        "lastMsg": {
            "msgType": 0, 
            "senderId": "1739395", 
            "msgId": "97580724164624398", 
            "msgContent": "gogogo", 
            "createTime": "1489544598000"
        }
    }
]
```

> 2、messages必需字段
```javascript
[
    {
        "msgType": 0, 
        "senderId": "1739395", 
        "msgId": "97580724164624398", 
        "msgContent": "gogogo", 
        "createTime": "1489544598000"
    }
]
```
> 3、推送消息必需字段

{
  "type”:type,
  "content":content
}
* type

* content字段要求如下：⤵️
```
{
    "sessionId":"1739395",
    "msgType":0,
    "senderId":"1739395",
    "msgId":"97580724164624398",
    "msgContent":"gogogo",
    "createTime":"1489544598000"
}
```


**sessionList.lastMsg的属性字段要和messages中的字段相匹配**

## 事件

IM_SEND_MESSAGE     普通消息
  
IM_UNREAD_MESSAGE_NUM ‘总共未读数’

IM_SESSION_UPDATE 状态改变

    // 值域：
    // 会话状态被定义为一个short型的变量(2个字节).
    //      0x80:删除状态,二进制的形式是1000 0000;
    //      0x00:普通状态,二进制的形式是0000 0000;
    //      0x10:置顶状态,二进制的形式是0001 0000.
    //      0x100:屏蔽消息状态,二进制的形式是0000 0001 0000 0000
    //      0x200:禁止回复状态,二进制的形式是0000 0010 0000 0000
    //      0x400:非交互模式,二进制的形式是0000 0100 0000 0000

IM_B_MESSAGE_READ ‘对方已读的提醒’
