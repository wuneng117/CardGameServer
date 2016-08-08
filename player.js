
var PLAYTER_UPDATE_ISTURNACTIVE = 1;
var PLAYTER_UPDATE_HP       = 1<<1;
var PLAYTER_UPDATE_CRITICAL = 1<<2;
var PLAYTER_UPDATE_MAXCRITICAL = 1<<3;
// var PLAYTER_UPDATE_ISACTIVE = 16;
// var PLAYTER_UPDATE_ISACTIVE = 32;
// var PLAYTER_UPDATE_ISACTIVE = 64;
// var PLAYTER_UPDATE_ISACTIVE = 128;
// var PLAYTER_UPDATE_ISACTIVE = 256;
// var PLAYTER_UPDATE_ISACTIVE = 512;
// var PLAYTER_UPDATE_ISACTIVE = 1024;

function Player(gameConn)
{
    this.gameConn = gameConn;
    this.duel = null;   //战斗管理
    this.idx = -1;
    this.teamColor = -1;
    this.isTurnActive = false;  //行动标志
    this.nextPlayer = null; //下一个行动玩家

    this.heroName = '';   //英雄名字
    this.hp = 30;         //英雄生命值
    this.critical = 0;    //英雄当前水晶数
    this.maxCritical = 0; //英雄当前回合最大水晶数
    
    this.deckArray = [];  //卡组数组（Card类型）
    this.handArray = [];  //手牌数组（Card类型）
    this.fieldArray = []; //场上随从数组（CardMonster类型）

    //this.handCardSpriteArray = []; //手牌图片数组
    //this.monsterSpriteArray = [];  //随从图片数组
}

//打包数据完整
Player.prototype.packDataAll = function(data)
{
    data.idx = this.idx;
    data.temColor = this.teamColor;
    data.isTurnActive = this.isTurnActive;
    data.heroName = this.heroName;
    data.hp = this.hp;
    data.critical = this.crititcal;
    data.maxCritical = this.maxCritical;
}


//打包数据
Player.prototype.packData = function(data, flag)
{
    data.flag = flag;
    data.idx = this.idx;

    if(flag & PLAYTER_UPDATE_ISTURNACTIVE)
        data.isTurnActive = this.isTurnActive;
    if(flag & PLAYTER_UPDATE_HP)
        data.hp = this.hp;
    if(flag & PLAYTER_UPDATE_CRITICAL)
        data.critical = this.critical;
    if(flag & PLAYTER_UPDATE_MAXCRITICAL)
        data.maxCritical = this.maxCritical;
}


//解开数据
Player.prototype.unPackData = function(data)
{
    var flag = data.flag;
    
    if(flag & PLAYTER_UPDATE_ISTURNACTIVE)
        this.isTurnActive = data.isTurnActive;
    if(flag & PLAYTER_UPDATE_HP)
        this.hp = data.hp;
    if(flag & PLAYTER_UPDATE_CRITICAL)
        this.critical = data.critical;
    if(flag & PLAYTER_UPDATE_MAXCRITICAL)
        this.maxCritical = data.maxCritical;
}

//初始化
Player.prototype.init = function(duel, idx, teamColor)
{
    this.duel = duel;
    this.idx = idx;
    this.teamColor = teamColor;
    this.isTurnActive = false;
    this.nextPlayer = null; 

    this.heroName = this.getPlayerName();
    this.hp = 30;         
    this.critical = 0;    
    this.maxCritical = 0;

    this.deckArray = [];
    this.handArray = []; 
    this.fieldArray = []; 
}

//设置下个玩家
Player.prototype.setNextPlayer = function(next)
{
    this.nextPlayer = next;
}

Player.prototype.getNextPlayer = function()
{
    return this.nextPlayer;
}

//设置是否行动回合
Player.prototype.setTurnActive = function(isActive)
{
    this.isTurnActive = isActive;
}

//设置IDX
Player.prototype.setIdx = function(idx)
{
    this.idx = idx;
}

//获取玩家名字
Player.prototype.getPlayerName = function()
{
    return this.gameConn.getAccountName();  //先用账号名代替
}

//设置游戏管理
Player.prototype.setDuel = function(duel)
{
    this.duel = duel;
}

Player.prototype.getDuel = function()
{
    return this.duel;
}

Player.prototype.getGameConn = function()
{
    return this.gameConn;
}

init
createDeck
drawDeck
reduceHp
refreshMonsterField
getHp

module.exports = Player;

