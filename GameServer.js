const ClientConn = require('ClientConn');
const Duel = require('duel');
const CardDataManager = require('CardDataManager');

var MAX_DUEL_NUM = 1;

function GameServer()
{
    this.clientMap = {};    //客户端连接列表
    this.clientIdx = 0;     //当前分配IDX编号

    //游戏管理
    this.duelVec = [];
}

//初始化
GameServer.prototype.init = function()
{
    this.initData();
    this.initDuel();
    this.initSocket();
}

//初始化数据
GameServer.prototype.initData = function()
{
    gCardDataManager = new CardDataManager();
    gCardDataManager.init();
}

//初始化游戏管理
GameServer.prototype.initDuel = function()
{
    for(var i=0; i<MAX_DUEL_NUM; ++i)
    {
        var duel = new Duel();
        this.duelVec.push(duel);
    }
}

//初始化网络
GameServer.prototype.initSocket = function() 
{
    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);
    app.use(express.static(__dirname + '/public'));
    
    var self = this;

    //有客户端连接
    io.on('connection', function(socket) {
        self.clientIdx++;
        console.log('a user connected, idx:',self.clientIdx);
        
        //将客户端连接加入到clientMap
        var clientConn = new ClientConn(self.clientIdx, socket, self);
        self.clientMap[self.clientidx] = clientConn;

        //给客户端回复
        socket.emit(WC_CONNECTED, {idx : self.clientIdx});
    });

    http.listen(3000, function() {
        console.log('listening on : 3000');
    });
}

//检查重复登录
GameServer.prototype.isAccountOnline = function(accountName)
{
    for(var clientConn of this.clientMap)
    {
        if(clientConn && clientConn.getAccountName() == accountName)
            return true;
    }

    return false;
}

//返回空房间
GameServer.prototype.getRestDuel = function()
{
    return this.duelVec[0]; //目前默认返回第一个
}

module.exports = GameServer;
