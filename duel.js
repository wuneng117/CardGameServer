const ClientConn = require('ClientConn');

function Duel()
{
    this.clientMap = {};
    this.clientIdx = 0;

    this.initSocket = function() 
    {
        var express = require('express');
        var app = express();
        var http = require('http').Server(app);
        var io = require('socket.io')(http);
        app.use(express.static(__dirname + '/public'));
        
        var self = this;

        //增加客户端连接
        io.on('connection', function(socket){
            self.clientIdx++;
            console.log('a user connected, idx:',self.clientIdx);

            var clientConn = new ClientConn(self.clientIdx, socket, self);
            self.clientMap[self.clientidx] = clientConn;

            //给客户端回复
            socket.emit(WC_CONNECTED, {idx : self.clientIdx, name : '魔兽世界'});
        });

        http.listen(3000, function(){
            console.log('listening on : 3000');
        });
    }
}

module.exports = Duel;
