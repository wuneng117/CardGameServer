const ClientConn = require('ClientConn');

//对战状态
var DUEL_STATE_REST = 0;
var DUEL_STATE_PLAYING = 1;

//分组
var TEAM_COLOR_NONE = -1;
var TEAM_COLOR_RED = 1;
var TEAM_COLOR_BLUE = 2;

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

//添加玩家
Duel.prototype.addPlayer = function(player)
{
    //第一个玩家等待
    if(this.playerVec.length === 0)
    {
        player.init(this, this.playerVec.length, TEAM_COLOR_RED);
        this.playerVec.push(player);

        //同步玩家数据
    }
    //第二个玩家开战
    else if(this.playerVec.length === 1)
    {
        this.playerVec[this.playerVec.length-1].setNextPlayer(player);  //设置上一个玩家的下一个玩家为这个玩家
        player.setNextPlayer(this.playerVec[this.playerVec.length-1]);  //设置这一个玩家的下一个玩家为上个玩家
        player.init(this, this.playerVec.length, TEAM_COLOR_BLUE);
        this.playerVec.push(player);

        //开始对战
        this.startGame();

        //同步玩家数据
    }
    //超过2个，观战……
    else
    {
        player.init(this, this.playerVec,length, TEAM_COLOR_NONE);
        this.playerVec.push(player);

        //同步玩家数据
    }

    return true;
}

//开始游戏
Duel.prototype.startGame = function() 
{
    //玩家初始化
    for(player of this.playerVec)
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

module.exports = Duel;
