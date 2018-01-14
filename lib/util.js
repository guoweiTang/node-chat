/**
 * [factoryId 生成虚拟id的工厂]
 * @return {[type]} [description]
 */
exports.createFactoryId = function (){
	return '' + parseInt(Math.random()*Math.pow(10, 4)) + parseInt(Math.random()*Math.pow(10, 4))
},
exports.getBothSessionIdRegExp = function(sessionId){
	var sessionIdArr = sessionId.split('-');
	return new RegExp('^(' + sessionId + ')\|(' + [sessionIdArr[1], sessionIdArr[0]].join('-') + ')$');
}

