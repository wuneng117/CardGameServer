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
        data.flag &= PLAYER_UPDATE_ISREADY;
        player.packetData(data);
        eachPlayer.getClientConn().sendPacket(WC_DUELREADY, data);
    }

    if(readNum < 2)
        return;
    
    this.startGame();
}

//开始游戏
Duel.prototype.startGame = function() 
{
    //玩家初始化
    for(var player of this.playerVec)
    {
        //player.init(this);
        player.createDeck(tempDeck);//根据牌池生成卡组
        player.drawDeck(3);
    }

    var firstIdx = Math.round(Math.random());

    this.turnPlayer = this.playerVec[firstIdx];

    this.turn = 0;
    this.changePhase(PHASE_BEGIN_TURN);

    console.log('开始游戏')
},
    
//随从攻击玩家
Duel.prototype.monsterAtkPlayer = function(monster, player) 
{
    var atk = monster.getAtk();
    if(!monster || atk <= 0 || monster.isAtked() === true)
        return;
            
    monster.setAtked(true);
    player.reduceHp(atk);
    player.refreshMonsterField();
    
    //showTipLabel(monster._player.heroName + '的' + monster.cardName + ' 攻击了玩家 ' + player.heroName);

    this.checkWin();
}
    
//随从攻击随从
Duel.prototype.monsterAtkMonster = function(src, dest) 
{
    var atk = src.getAtk();
    if(!src || !dest || atk <= 0 || src.isAtked() === true)
        return;

    srcsetAtked(true);
    dest.reduceHp(atk);

    var damage = dest.getAtk();
    src.reduceHp(damage);
    
    //showTipLabel(src._player.heroName + '的' + src.cardName + ' 攻击了 ' + dest._player.heroName + '的' + dest.cardName, cc.Color.RED);
},
    
//判断输赢
Duel.prototype.checkWin = function() 
{
    var hp0 = this.playerVec[0].getHp();
    var hp1 = this.playerVec[1].getHp();

    if(hp0 <= 0 && hp1 <= 0)
    {
        //showTipLabel("平局");
    }
    else if(hp0 <= 0)
    {
        //showTipLabel("%s 胜利", this.opponentPlayer.heroName);
    }
    else if(hp1 <= 0)
    {
        //showTipLabel("% 胜利", this.turnPlayer.heroName);
    }
},

//交换行动玩家
Duel.prototype.changeTurnPlayer = function() 
{
    this.turnPlayer.setTurnActive(false);    //不可行动
    this.turnPlayer = this.turnPlayer.getNextPlayer();
    this.turnPlayer.setTurnActive(true);    //可行动
}

//-----------------------------回合阶段执行函数---------------------------------\\
Duel.prototype.enterPhaseBegin = function() 
{
        console.log('enterPhaseBegin');
        ++this.turn;
        this.changeTurnPlayer();
        console.log(this.turnPlayer.getPlayerName() + '的回合');

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
