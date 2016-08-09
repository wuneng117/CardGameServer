
var PLAYER_UPDATE_ISTURNACTIVE = 1;
var PLAYER_UPDATE_HP       = 1<<1;
var PLAYER_UPDATE_CRITICAL = 1<<2;
var PLAYER_UPDATE_MAXCRITICAL = 1<<3;
var PLAYER_UPDATE_ISREADY = 1<<4;
// var PLAYTER_UPDATE_ISACTIVE = 16;
// var PLAYTER_UPDATE_ISACTIVE = 32;
// var PLAYTER_UPDATE_ISACTIVE = 64;
// var PLAYTER_UPDATE_ISACTIVE = 128;
// var PLAYTER_UPDATE_ISACTIVE = 256;
// var PLAYTER_UPDATE_ISACTIVE = 512;
// var PLAYTER_UPDATE_ISACTIVE = 1024;

function Player(clientConn)
{
    this.clientConn = clientConn;
    this.duel = null;   //战斗管理
    this.idx = -1;
    this.teamColor = -1;
    this.isTurnActive = false;  //行动标志
    this.isReady = false;   //是否准备游戏
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
    data.isReady = this.isReady;
    data.heroName = this.heroName;
    data.hp = this.hp;
    data.critical = this.crititcal;
    data.maxCritical = this.maxCritical;
}

//解开数据完整
Player.prototype.unPackDataAll = function(data)
{
    this.idx = data.idx;
    this.teamColor = data.temColor;
    this.isTurnActive = data.isTurnActive;
    this.isReady = data.isReady;
    this.heroName = data.heroName;
    this.hp = data.hp;
    this.crititcal = data.critical;
    this.maxCritical = data.maxCritical;
}

//打包数据
Player.prototype.packData = function(data, flag)
{
    data.flag = flag;
    data.idx = this.idx;

    if(flag & PLAYER_UPDATE_ISTURNACTIVE)
        data.isTurnActive = this.isTurnActive;
    if(flag & PLAYER_UPDATE_HP)
        data.hp = this.hp;
    if(flag & PLAYER_UPDATE_CRITICAL)
        data.critical = this.critical;
    if(flag & PLAYER_UPDATE_MAXCRITICAL)
        data.maxCritical = this.maxCritical;    
    if(flag & PLAYER_UPDATE_ISREADY)
        data.isReady = this.isReady;
}


//解开数据
Player.prototype.unPackData = function(data)
{
    var flag = data.flag;
    
    if(flag & PLAYER_UPDATE_ISTURNACTIVE)
        this.isTurnActive = data.isTurnActive;
    if(flag & PLAYER_UPDATE_HP)
        this.hp = data.hp;
    if(flag & PLAYER_UPDATE_CRITICAL)
        this.critical = data.critical;
    if(flag & PLAYER_UPDATE_MAXCRITICAL)
        this.maxCritical = data.maxCritical;
    if(flag & PLAYER_UPDATE_ISREADY)
        this.isReady = data.isReady;

}

//初始化
Player.prototype.init = function(duel, idx, teamColor)
{
    this.duel = duel;
    this.idx = idx;
    this.teamColor = teamColor;
    this.isTurnActive = false;

    this.heroName = this.getPlayerName();
    this.hp = 30;         
    this.critical = 0;    
    this.maxCritical = 0;

    this.deckArray = [];
    this.handArray = []; 
    this.fieldArray = []; 
}

Player.prototype.getReady = function()
{
    this.isReady = true;
    //发送更新
    var data = {};
    data.flag = PLAYER_UPDATE_ISREADY;
    this.packData(data);
    this.clientConn.sendPacket(WC_PLAYER_UPDATE, data);
}
// //设置下个玩家
// Player.prototype.setNextPlayer = function(next)
// {
//     this.nextPlayer = next;
// }

// Player.prototype.getNextPlayer = function()
// {
//     return this.nextPlayer;
// }

//设置是否行动回合
Player.prototype.setTurnActive = function(isActive) { this.isTurnActive = isActive; }
Player.prototype.getTurnActive = function() { return this.isTurnActive; }

//设置IDX
Player.prototype.setIdx = function(idx) { this.idx = idx; }
Player.prototype.getIdx = function() { return this.idx; }

//获取玩家名字
Player.prototype.getPlayerName = function() { return this.clientConn.getAccountName(); }

//设置游戏管理
Player.prototype.setDuel = function(duel) { this.duel = duel; }
Player.prototype.getDuel = function() { return this.duel; }

//获取客户端连接
Player.prototype.getClientConn = function() { return this.clientConn; }

//设置玩家阵营
Player.prototype.setTeamColor = function(color) { this.teamColor = color; }
Player.prototype.getTeamColor = function() { return this.teamColor; }

//设置玩家准备游戏
Player.prototype.getIsReady = function() { return this.isReady; }

init
createDeck
drawDeck
reduceHp
refreshMonsterField
getHp

module.exports = Player;

