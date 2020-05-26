## 案例应用DEMO参考
[聊天小demo](http://guoweitang.net)
## 启动
进入项目根目录：
```shell
~ npm install
```
进入./public目录下：
```shell
~ npm install
```
启动mongodb：
```shell
~ mongod
```
返回项目根目录：
```shell
~ npm run dev
```
## 使用
- [LGChat](#dix)
  - [LGChat.on](#on) 监听事件
    - connect
    - disconnect
    - reconnect
    - message
    - FE_DEFAULT_MESSAGE
    - FE_SESSION_UPDATE
    - ADD_NEW_SESSION
    - ADD_NEW_MESSAGE
  - [LGChat.trigger](#trigger) 触发事件(同on)
  - [LGChat.off](#off) 移除事件(同on)
  ---
  - [connect(url[, opt])](#connect)建立连接
  - [addSessionList(arr|obj)](#addSessionList) 会话列表追加数据
  - [addMessages(id[,arr])](#addMessages) 设置消息列表
  - [addListAndMessages(obj)](#addListAndMessages) 更新会话&&消息
  - [delSessionById(id)](#delSessionById) 删除会话
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
      "sessionId": String, 
      "createTime": Date, 
      "unreadCount": Number, 
      "status": Number, //status{0:正常状态, 1:已删除, 2:已置顶}，注意：三种状态是互斥的
      "lastMsg": {
          "msgType": Number, //msgType{0:文本, 1:图文混合, 2:图片, 3:语音}
          "senderId": String, 
          "msgId": String, 
          "msgContent": String, 
          "createTime": Date
      }
    }
]
```
**sessionList.lastMsg的属性字段要和messages中的字段相匹配**

> 2、messages必需字段
```javascript
[
    {
      "sessionId": String,
      "msgType": Number, 
      "senderId": String, 
      "msgId": String, 
      "msgContent": String, 
      "createTime": String
    }
]
```

> 3、推送消息必需字段

{
  "type”:type,
  "content":content
}
* type
IM_SEND_MESSAGE     普通消息
  
IM_SESSION_UPDATE 状态改变

* content字段同2中其中一条消息
