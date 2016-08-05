const DBConn = require('DBConn')

var ERROR_NOERROR = 0;


var ERROR_ENTERROOM_INROOM = 1;
function EventProcess(clientConn)
{
    this.clientConn = clientConn;
    //console.log(typeof(this.clientConn));

    //注册消息处理函数
    this.clientConn.registerHandler('disconnect', this.disconnect.bind(this));
    this.clientConn.registerHandler(CW_LOGIN_REQUEST, this[CW_LOGIN_REQUEST].bind(this));
    this.clientConn.registerHandler(CW_ENTERROOM_REQUEST, this[CW_ENTERROOM_REQUEST].bind(this));
}

//失去客户端连接
EventProcess.prototype.disconnect = function() 
{
    this.clientConn.disconnect();
}

//客户端登录请求
EventProcess.prototype[CW_LOGIN_REQUEST] = function(param) 
{
    //console.log(msg);
    var callback = function(error, user) {
        //登录成功
        if(error === LOGIN_ERROR_NOERROR)
            this.clientConn.login(user);

        this.clientConn.sendPacket(WC_LOGIN_RESPONSE, {error : error, account: this.clientConn.account});
    }

    DBConn.login(param, callback.bind(this));
}

//用户进入房间请求
EventProcess.prototype[CW_ENTERROOM_REQUEST] = function() 
{
    var player = this.clientConn.getPlayer();
    var duel = player.getDuel();
    //已经在房间了
    if(duel)
    {
        this.clientConn.sendPacket(WC_ENTERROOM_RESPONSE, {error: ERROR_ENTERROOM_INROOM});
        return;
    }

    var server = this.clientConn.getServer();
    duel = server.getRestDuel();
    if(duel.addPlayer(player))
    {
        this.clientConn.sendPacket(WC_ENTERROOM_RESPONSE, {error: 0});
    }
}











module.exports = EventProcess;


