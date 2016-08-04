const DBConn = require('DBConn')

function EventProcess(clientConn)
{
    this.clientConn = clientConn;
    //console.log(typeof(this.clientConn));

    //注册消息处理函数
    this.clientConn.registerHandler('disconnect', this.disconnect.bind(this));
    this.clientConn.registerHandler(CW_LOGIN, this[CW_LOGIN].bind(this));
}

//失去客户端连接
EventProcess.prototype.disconnect = function() {
    this.clientConn.disconnect();
};

//客户端登录
EventProcess.prototype[CW_LOGIN] = function(param) {
    //console.log(msg);
    var callback = function(error, user) {
        //登录成功
        if(error === LOGIN_ERROR_NOERROR)
            this.clientConn.login(user);

        this.clientConn.sendPacket(WC_LOGIN, {error : error, account: this.clientConn.account});
    }

    DBConn.login(param, callback.bind(this));

};











module.exports = EventProcess;


