function Util(){
	this.config = {
		defaultPic: '/upload-sources/i/default-head.jpg'
	}
}
Util.prototype = {
	/**
	 * [factoryId 生成虚拟id的工厂]
	 * @return {[type]} [description]
	 */
	createFactoryId: function (){
		return '' + parseInt(Math.random()*Math.pow(10, 4)) + parseInt(Math.random()*Math.pow(10, 4))
	},
	getBothSessionIdRegExp: function(sessionId){
		var sessionIdArr = sessionId.split('-');
		return new RegExp('^(' + sessionId + ')\|(' + [sessionIdArr[1], sessionIdArr[0]].join('-') + ')$');
	}
}

module.exports = new Util();
