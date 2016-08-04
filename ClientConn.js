const EventProcess = require('EventProcess');
const Account = require('account')

var CLIENT_STATE_GUIDE = 0;
var CLIENT_STATE_LOGININ = 1;
var CLIENT_STATE_DISBAND = 2;

function ClientConn(idx, socket, duel) {
    this.clientId = idx;
    this.socket = socket;
    this.duel = duel;
    this.account = null;
    this.state = CLIENT_STATE_GUIDE;

    this.eventProcess = new EventProcess(this);
}

//客户端正常登录
ClientConn.prototype.login = function(user) {
    this.account = new Account(user.AccountName, user.password);
    this.state   = CLIENT_STATE_LOGININ;
}

//给客户端发送消息
ClientConn.prototype.sendPacket = function(msgID, param) {
    this.socket.emit(msgID, param);
}

//注册服务器事件函数
ClientConn.prototype.registerHandler = function(msgID, func) {
    this.socket.on(msgID, func);
}

//客户端断开连接事件
ClientConn.prototype.disconnect = function() {
    console.log('a user diconnected, idx:%d', this.clientId);
    delete this.duel.clientMap[this.clientId];

    //如果在战斗中，进行一些其他处理
}

module.exports = ClientConn;