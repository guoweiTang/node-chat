//umd规范
"use strict";
define(function(require, exports, module) {
    function EventTarget() {
        this.handlers = {};
    }
    EventTarget.prototype = {
        constructor: EventTarget,
        on: function(type, handler) {
            if (typeof this.handlers[type] == 'undefined') {
                this.handlers[type] = [];
            }
            this.handlers[type].push(handler);
        },
        off: function(type, handler) {
            if (this.handlers[type] instanceof Array) {
                var theHandlers = this.handlers[type];
                //若未指定函数，删除该实例指定的自定义事件
                if(typeof theHandlers === 'undefined'){
                    delete this.handlers[type];
                    return;
                }
                for (var i = 0, len = theHandlers.length; i < len; i++) {
                    if (theHandlers[i] === handler) {
                        theHandlers.splice(i, 1);
                        break;
                    }
                }
            }
        },
        trigger: function() {
            var _arguments = Array.from(arguments);
            var theHandlers = this.handlers[_arguments[0]];
            if (theHandlers instanceof Array) {
                theHandlers.forEach(function(theItem) {
                    theItem.apply(this, _arguments.slice(1));
                })
            }
        }
    }
    function createEventsInstance(target) {
        return new EventTarget();
    }
    /**
     * [parseTimes2String 格式化时间为指定格式]
     * @param  {[Number/String]} time   [description]
     * @param  {[String]} format [description]
     * @return {[String]}        [description]
     */
    function parseTimes2String(time, format){
        var t, arr, month;
        time = Number(time);
        if(!isNaN(time)){
            t = new Date(time);
            month = t.getMonth() + 1;
            arr = t.toString().split(' ');
            return arr[3] + '-' + (month < 10 ? '0' + month : month) + '-' + arr[2] + ' ' + arr[4];
        }
        return time;
    }
    return {
        createEventsInstance: createEventsInstance,
        parseTimes2String: parseTimes2String
    }
})
