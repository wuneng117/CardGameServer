const ClientConn = require('ClientConn');

//对战状态
var DUEL_STATE_REST = 0;
var DUEL_STATE_PLAYING = 1;

//分组
var TEAM_COLOR_NONE = -1;
var TEAM_COLOR_RED = 1;
var TEAM_COLOR_BLUE = 2;

//Player更新标志
var PLAYER_UPDATE_ISTURNACTIVE = 1;
var PLAYER_UPDATE_HP       = 1<<1;
var PLAYER_UPDATE_CRITICAL = 1<<2;
var PLAYER_UPDATE_MAXCRITICAL = 1<<3;
var PLAYER_UPDATE_ISREADY = 1<<4;
var PLAYER_UPDATE_DECKNUM = 1<<5;

//Card更新标志
var CARD_UPDATE_CARDNAME = 1<<1;
var CARD_UPDATE_CRITICAL = 1<<2;
var CARD_UPDATE_ATK = 1<<3;
var CARD_UPDATE_HP = 1<<4;

//Monster更新标志
var MONSTER_UPDATE_CARDNAME = 1<<1;
var MONSTER_UPDATE_CRITICAL = 1<<2;
var MONSTER_UPDATE_ATK = 1<<3;
var MONSTER_UPDATE_HP = 1<<4;
var MONSTER_UPDATE_MAXHP = 1<<5;
var MONSTER_UPDATE_ISATKED = 1<<6;

var tempDeck = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L'];

function Duel()
{
    this.playerVec = [];
    this.state = DUEL_STATE_REST;

    this.turn = 0;    //每个玩家一回合加一次
    this.round = 0;   //每个玩家都行动过一回合加一次
    
    this.turnPlayer = null; //当前玩家

    //-----------------------------回合阶段执行函数---------------------------------\\
    this.phaseState = PHASE_NULL;
    this.enterTurnFunc = [];
    this.leaveTurnFunc= [];

    this.enterTurnFunc[PHASE_BEGIN_TURN] = this.enterPhaseBegin.bind(this);
    this.enterTurnFunc[PHASE_MAIN_TURN] = this.enterPhaseMain.bind(this);
    this.enterTurnFunc[PHASE_END_TURN] = this.enterPhaseEnd.bind(this);
    
    this.leaveTurnFunc[PHASE_BEGIN_TURN] = this.leaveBeginTurn.bind(this);
    this.leaveTurnFunc[PHASE_MAIN_TURN] = this.leaveMainTurn.bind(this);
    this.leaveTurnFunc[PHASE_END_TURN] = this.leaveEndTurn.bind(this);
    //-------------------------------------------------------------------------------\\
}

//添加玩家入房间
Duel.prototype.addPlayer = function(player)
{
    this.addPlayerToVec(player, TEAM_COLOR_NONE);

    var data = {};
    player.packDataAll(data);
    //添加玩家到所有客户端
    for(var eachPlayer of this.playerVec)
    {
        eachPlayer.getClientConn().sendPacket(WC_PLAYER_ADD, data);
    }

    //将房间玩家信息发送给加入玩家
    //////
    ////
    ///
    if(this.state === DUEL_STATE_REST)
    {
        for(var eachPlayer of this.playerVec)
        {
            if(eachPlayer.getIdx() === player.getIdx())
                continue;
            
            var eachData  ={};
            eachPlayer.packDataAll(eachdata);
            player.getClientConn().sendPacket(WC_PLAYER_ADD, eachdata);
        }
    }

    
    //聊天窗口通知
    var param = {};
    param.message = '[系统]:用户' + player.getPlayerName() + '进入了房间.';
    param.isSystem = true;
    for(var tempPlayer of this.playerVec)
    {
        tempPlayer.getClientConn().sendPacket(WC_CHAT_ADD, param);
    }
    
    return true;
}

//添加玩家到数组
Duel.prototype.addPlayerToVec = function(player,color)
{
    var playerVec = this.playerVec;
    var idx = playerVec.length;
    player.init(this, idx, color);
    playerVec.push(player);
}

//获取下个行动玩家
Duel.prototype.getNextPlayer = function()
{
    var player = this.turnPlayer;
    var idx;
    {
        idx = player.getIdx();
        if(idx === this.playerVec.length - 1)
            idx = 0;
        else
            idx++;
    }
    while(player.getTeamColor() === TEAM_COLOR_NONE);

    this.turnPlayer = player;
}

//有玩家已经准备就绪
Duel.prototype.playerGetReady = function(player)
{
    var readyNum = 0;
    for(var eachPlayer of this.playerVec)
    {
        //统计准备人数
        if(eachPlayer.getIsReady() === true)
            readNum++;
        
        //给所有客户端发送此玩家更新
        var data = {};
        data.flag = PLAYER_UPDATE_ISREADY;
        player.packData(data);
        eachPlayer.getClientConn().sendPacket(WC_DUELREADY, data);
    }

    if(readNum < 2)
        return;
    
    this.startGame();
}

//开始游戏
Duel.prototype.startGame = function() 
{
    
    var teamColor = TEAM_COLOR_RED;
    //玩家初始化
    for(var player of this.playerVec)
    {
        if(!player.getIsReady())
            continue;

        player.createDeck(tempDeck);//根据牌池生成卡组

        //更新
        var data = {};
        data.flag = PLAYER_UPDATE_DECKNUM;
        player.packData(data);
        this.broadcastPacket(WC_PLAYER_UPDATE, data);

        //抽3张卡
        player.drawDeck(3);

        //分组
        player.setTeamColor(teamColor);
        this.turnPlayer = player;    
        teamColor = TEAM_COLOR_BLUE; //设置完红的再设置为蓝的
    }


    //var firstIdx = Math.round(Math.random());

    this.turn = 0;
    this.changePhase(PHASE_BEGIN_TURN);

    console.log('开始游戏');
    this.broadcastPacket(WC_CHAT_ADD, {message: '开始游戏',
                                       isSystem: true});
},

//玩家创建手牌(对自己和其他玩家是不同处理的，所以不能统一广播)
Duel.prototype.handCardCreate = function(player, card)
{
    var data = {};
    for(var temp of this.playerVec)
    {
        data = {};
        if(temp.getIdx() == player.getIdx())
            card.packDataAll(data,false);
        else
            card.packDataAll(data, true);

        temp.getClientConn().sendPacket(WC_HANDCARD_CREATE, {playerIdx: player.getIdx(), param: data});
    }
}

//玩家更新手牌(对自己和其他玩家是不同处理的，所以不能统一广播)
Duel.prototype.handCardUpdate = function(player, card, flag)
{
    var data = {};
    for(var temp of this.playerVec)
    {
        data = {};
        data.flag = flag;
        if(temp.getIdx() == player.getIdx())
            card.packData(data, flag, false);
        else
            card.packData(data, flag, true);

        temp.getClientConn().sendPacket(WC_HANDCARD_UPDATE, {playerIdx: player.getIdx(), param: data});
    }
}

//随从攻击玩家
Duel.prototype.monsterAtkPlayer = function(player, idx, targetPlayerIdx) 
{
    if(!player.getTurnActive())
        return;
    
    if(player.getIdx() === targetPlayerIdx)
        return;
    
    var targetPlayer = this.playerVec[targetPlayerIdx];
    if(!targetPlayer)
        return;
    
    var monster = player.getMonster(idx);

    if(!monster || monster.atk <= 0 || monster.isAtked === true || monster.isDead())
        return;

    this.broadcastPacket(WC_CHAT_ADD, {message: player.getPlayerName() + ' 的随从 ' + monster.cardName + ' 攻击了 ' + targetPlayer.getPlayerName(),
                                    isSystem: true});
     
    monster.setAtked(true);

    targetPlayer.reduceHp(atk);

    this.checkWin();
}
    
//随从攻击随从
Duel.prototype.monsterAtkMonster = function(player, idx, targetPlayerIdx, targetMonsterIdx) 
{
    if(!player.getTurnActive())
        return;
    
    if(player.getIdx() === targetPlayerIdx)
        return;
    
    var targetPlayer = this.playerVec[targetPlayerIdx];
    if(!targetPlayer)
        return;
    
    var monster = player.getMonster(idx);

    if(!monster || monster.atk <= 0 || monster.isAtked === true || monster.isDead())
        return;
    
    var targetMonster = targetPlayer.getMonster(targetMonsterIdx);
    if(!targetMonster || targetMonster.isDead())
        return;
    
    this.broadcastPacket(WC_CHAT_ADD, {message: player.getPlayerName() + ' 的随从 ' + monster.cardName + ' 攻击了 ' + 
                                                targetPlayer.getPlayerName() + '的随从 ' + targetMonster.cardName +',',
                                        isSystem: true});
     

    monster.setAtked(true);
    monster.reduceHp(targetMonster.atk);

    this.broadcastPacket(WC_CHAT_ADD, {message: player.getPlayerName() + ' 的随从 ' + monster.cardName + ' 收到了' + targetMonster.atk + '伤害',
                                       isSystem: true});
    targetMonster.reduceHp(monster.atk);
    this.broadcastPacket(WC_CHAT_ADD, {message: targetPlayer.getPlayerName() + ' 的随从 ' + targetMonster.cardName + ' 收到了' + monster.atk + '伤害',
                                       isSystem: true});
},
    
//判断输赢
Duel.prototype.checkWin = function() 
{
    var tempVec = [];

    for(var player of this.playerVec)
    {
        if(player.getIsReady())
            temVec.push(player);
    }

    var hp0 = tempVec[0].getHp();
    var hp1 = tempVec[1].getHp();

    if(hp0 <= 0 && hp1 <= 0)
    {
        for(var player of this.playerVec)
        {
            player.setTurnActive(false);

            var data = {};
            data.flag = PLAYER_UPDATE_ISTURNACTIVE;
            player.packData(data);
            player.getClientConn().sendPacket(WC_PLAYER_UPDATE, data);
        }

        this.broadcastPacket(WC_CHAT_ADD, {message: '游戏平局', isSystem: true});
    }
    else if(hp0 <= 0)
    {
        for(var player of this.playerVec)
        {
            player.setTurnActive(false);

            var data = {};
            data.flag = PLAYER_UPDATE_ISTURNACTIVE;
            player.packData(data);
            player.getClientConn().sendPacket(WC_PLAYER_UPDATE, data);
        }

        this.broadcastPacket(WC_CHAT_ADD, {message: tempVec[0].getPlayerName() + '的胜利', isSystem: true});
    }
    else if(hp1 <= 0)
    {
        for(var player of this.playerVec)
        {
            player.setTurnActive(false);

            var data = {};
            data.flag = PLAYER_UPDATE_ISTURNACTIVE;
            player.packData(data);
            player.getClientConn().sendPacket(WC_PLAYER_UPDATE, data);
        }

        this.broadcastPacket(WC_CHAT_ADD, {message: tempVec[1].getPlayerName() + '的胜利', isSystem: true});

    }
},

//交换行动玩家
Duel.prototype.changeTurnPlayer = function() 
{
    this.turnPlayer.setTurnActive(false);    //不可行动
    this.turnPlayer = this.turnPlayer.getNextPlayer();
    this.turnPlayer.setTurnActive(true);    //可行动

    var data = {};
    data.flag = PLAYER_UPDATE_ISTURNACTIVE;
    this.turnPlayer.packData(data);
    this.turnPlayer.getClientConn().sendPacket(WC_PLAYER_UPDATE, data);
}

//向所有玩家广播消息
Duel.prototype.broadcastPacket = function(msg, param)
{
    for(var player of this.playerVec)
    {
        player.getClientConn().sendPacket(msg, param);
    }
}

//-----------------------------回合阶段执行函数---------------------------------\\
Duel.prototype.enterPhaseBegin = function() 
{
        console.log('enterPhaseBegin');
        ++this.turn;
        this.changeTurnPlayer();
        this.broadcastPacket(WC_CHAT_ADD, {message: this.turnPlayer.getPlayerName() + ' 的回合',
                                           isSystem: true});

        this.turnPlayer.criticalPlus(1);        //增加水晶
        this.turnPlayer.criticalRecover();      //回复水晶
        this.turnPlayer.awakenMonster();        //重置随从攻击次数
        this.turnPlayer.drawDeck(1);            //抽1张卡
}

Duel.prototype.leavePhaseBegin = function()
{

}   

Duel.prototype.enterPhaseMain = function()
{
    
}

Duel.prototype.leavePhaseMain = function()
{

}

Duel.prototype.enterPhaseEnd = function()
{

}

Duel.prototype.leavePhaseEnd = function()
{      
    this.turnPlayer.setTurnActive(false);

    var data = {};
    data.flag = PLAYER_UPDATE_ISTURNACTIVE;
    this.turnPlayer.packData(data);
    this.turnPlayer.getClientConn().sendPacket(WC_PLAYER_UPDATE, data);
}
        
 Duel.prototype.changePhase = function(nextState) 
 {
    if(this.phaseState !== PHASE_NULL)
    {
        this.leaveTurnFunc[this.phaseState]();
    }
    
    this.enterTurnFunc[nextTurnType]();
    this.phaseState = nextState;
}
//-------------------------------------------------------------------------------\\

Duel.prototype.getPlayer = function(idx)
{
    return this.playerVec[idx];
}

//游戏状态
Duel.prototype.isPlaying = function() { return this.state === DUEL_STATE_PLAYING; }
module.exports = Duel;
