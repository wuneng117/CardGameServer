const EventProcess = require('EventProcess');
const Account = require('account')
const Player = require('player')

var CLIENT_STATE_GUIDE      = 0;
var CLIENT_STATE_LOGININ    = 1;
var CLIENT_STATE_DISBAND    = 2;

function ClientConn(idx, socket, server) {
    this.clientId = idx;
    this.socket = socket;
    this.server = server;
    this.account = null;
    this.state = CLIENT_STATE_GUIDE;

    this.eventProcess = new EventProcess(this);
    this.player = new Player(this);
}

//获取server
ClientConn.prototype.getServer = function()
{
    return this.server;
}

//获取player
ClientConn.prototype.getPlayer = function()
{
    return this.player;
}

//获取账号名字
ClientConn.prototype.getAccountName = function()
{
    return this.account.account;
}

//客户端正常登录
ClientConn.prototype.login = function(user) {
    //检查是否重复登录
    if(this.server.isAccountOnline(user.AccountName))
        return LOGIN_ERROR_LOGINED;

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
    delete this.server.clientMap[this.clientId];

    //如果在战斗中，进行一些其他处理
}

module.exports = ClientConn;