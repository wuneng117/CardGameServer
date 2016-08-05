const ClientConn = require('ClientConn');
const Duel = require('duel');

var MAX_DUEL_NUM = 1;

function GameServer()
{
    //客户端连接列表
    this.clientMap = {};
    this.clientIdx = 0;

    //游戏管理
    this.duelVec = [];
}

//初始化
GameServer.prototype.init = function()
{
    this.initDuel();
    this.initSocket();
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
    io.on('connection', function(socket){
        self.clientIdx++;
        console.log('a user connected, idx:',self.clientIdx);
        
        //将客户端连接加入到clientMap
        var clientConn = new ClientConn(self.clientIdx, socket, self);
        self.clientMap[self.clientidx] = clientConn;

        //给客户端回复
        socket.emit(WC_CONNECTED, {idx : self.clientIdx, name : '魔兽世界'});
    });

    http.listen(3000, function(){
        console.log('listening on : 3000');
    });
}

//初始化游戏管理
GameServer.prototype.initDuel = function()
{
    for(var i=0; i<MAX_DUEL_NUM; ++i)
    {
        var duel = new Duel();
        duel.init();
        this.duelVec.push(duel);
    }
}

//返回空房间
GameServer.prototype.getRestDuel = function()
{
    return this.duelVec[0]; //目前默认返回第一个
}

module.exports = GameServer;
