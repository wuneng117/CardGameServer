const Card = require('Card')
const Monster = require('Monster')

var PLAYER_UPDATE_ISTURNACTIVE = 1;
var PLAYER_UPDATE_HP       = 1<<1;
var PLAYER_UPDATE_CRITICAL = 1<<2;
var PLAYER_UPDATE_MAXCRITICAL = 1<<3;
var PLAYER_UPDATE_ISREADY = 1<<4;
var PLAYER_UPDATE_DECKNUM = 1<<5;
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
    this.deckNum = 30;    //牌组剩余卡牌

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
    data.deckNum = this.deckNum;
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
    this.deckNum = data.deckNum;
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
    if(flag & PLAYER_UPDATE_DECKNUM)
        data.deckNum = this.deckNum;
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
    if(flag & PLAYER_UPDATE_DECKNUM)
        this.deckNum = data.deckNum;

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
    this.deckNum = 30;

    this.deckArray = [];
    this.handArray = []; 
    this.fieldArray = []; 
}

Player.prototype.getReady = function()
{
    this.isReady = true;
}

//根据牌池随机创建卡组
Player.prototype.createDeck = function(cardArray) 
{
    var deckArray = this.deckArray;
    
    for(var i=0; i<30; ++i)
    {
        deckArray[i] = new Card();
        var randomKey = cardArray[Math.floor(Math.random()*cardArray.length)];
        var cardData = gCardDataManager.cardMap[randomKey];
        deckArray[i].init(cardData, this, i);
    }

    this.deckNum = deckArray.length;
}
    
//水晶回复
Player.prototype.criticalRecover = function() 
{
    this.critical = this.maxCritical;

    var data = {};
    this.packData(data, PLAYER_UPDATE_CRITICAL);
    this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
    //this.refreshcriticalsprite();   //刷新水晶图片
}

//水晶增加
Player.prototype.criticalPlus = function(num) 
{
    this.maxCritical += num;
    this.critical += num;
    if(this.maxCritical > 10)
        this.maxCritical = 10;
    if(this.critical > 10)
        this.critical = 10;
    //this.refreshcriticalsprite();   //刷新水晶图片

    var data = {};
    this.packData(data, PLAYER_UPDATE_CRITICAL & PLAYER_UPDATE_MAXCRITICAL);
    this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
},

//重置随从攻击次数
Player.prototype.awakenMonster = function() 
{
    var fieldArray = this.fieldArray;
    
    for(var i=0; i<fieldArray.length; ++i)
    {
        fieldArray[i].setAtked(false);
    }
},

//扣除HP
Player.prototype.reduceHp = function(num) 
{
    if(num <= 0)
        return;
    
    this.hp -= num;

    var data = {};
    this.packData(data, PLAYER_UPDATE_HP);
    this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
}

//回复HP
Player.prototype.addHp = function(num) 
{
    if(num <= 0)
        return;
        
    this.hp+= num;
    if(this.hp > 30)
        this.hp = 30;
    
    var data = {};
    this.packData(data, PLAYER_UPDATE_HP);
    this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
}

//创建手牌
Player.prototype.createCardToHand = function(card) 
{
    //游戏信息
    this.duel.broadcastPacket(WC_CHAT_ADD, {message: this.getPlayerName() + '抽了一张牌',
                                       isSystem: true});

    //超过10张就爆炸
    if(this.handArray.length >= 10)
    {
        return;
    }
    
    //改变序号，加入手牌数组
    card.idx = this.handArray.length;
    this.handArray.push(card);

    this.duel.handCardCreate(this, card);   //通知客户端玩家创建手牌
},

//抽牌
Player.prototype.drawDeck = function(num) 
{
    var deckArray = this.deckArray;
    
    if(deckArray.length > 0)
    {
        var card = deckArray.pop();
        this.createCardToHand(card);

        --this.deckNum;

        //更新牌组剩余牌
        var data = {};
        this.packData(data, PLAYER_UPDATE_DECKNUM);
        this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
    }
    else
    {
        this.reduceHp(1);
        //showTipLabel(this.heroName + " 的牌库没牌了，抽1张少1HP");
    }
    
    if(num<=1)
    {
        this.duel.checkWin();
    }
    else
    {
        this.drawDeck(num-1);
    }
}

//召唤随从
Player.prototype.summonMonster = function(cardIdx) 
{
    //如果随从已满返回
    if(this.fieldArray.length > 7)
        return false;
        
    var card = this.handArray[cardIdx]; //获取卡牌对象
    if(!card)
        return;

    var critical = card.critical;
    //如果水晶不够返回
    if(critical > this.critical)
    {
        //showTipLabel(this.heroName + " 只有 " + this.critical + ' 个水晶,不能召唤费用为' + critical + ' 的 ' + card.cardName + ' 到场上');
        return false;
    }

    this.critical -= critical;
    var data = {};
    this.packData(data, PLAYER_UPDATE_CRITICAL);
    this.duel.broadcastPacket(WC_PLAYER_UPDATE, data);
    
    //创建随从对象并加入随从数组
    var monster = new Monster();
    monster.init(card, this, this.fieldArray.length);
    this.fieldArray.push(monster);
    //游戏信息
    this.duel.broadcastPacket(WC_CHAT_ADD, {message: this.getPlayerName() + ' 召唤了1只 ' + monster.cardName,
                                       isSystem: true});

    var data = {};
    monster.packDataAll(data);
    this.duel.broadcastPacket(WC_MONSTER_CREATE, {playerIdx: this.idx, param: data});
                          
                            
    //删除手牌
    this.handArray.splice(cardIdx,1);
    this.duel.broadcastPacket(WC_HANDCARD_DELETE, {playerIdx: this.idx, idx: idx});
    this.refreshHandIdx(this.handArray);
}

//干掉随从
Player.prototype.killMonster = function(idx) 
{    
    this.handArray.splice(idx,1);
    this.duel.broadcastPacket(WC_HANDCARD_DELETE, {playerIdx: this.idx, idx: idx});
    this.refreshMonsterIdx(this.handArray);
},

//数组变动后需要刷新idx
Player.prototype.refreshHandIdx = function() 
{
    for(var i=0; i<this.handArray.length; ++i)
    {
        this.handArray[i].idx = i;
        this.duel.handCardUpdate(this, this.handArray[i], 0);
    }
},

Player.prototype.refreshMonsterIdx = function() 
{
    for(var i=0; i<this.fieldArray.length; ++i)
    {
        this.fieldArray[i].idx = i;
        
        var data = {};
        this.fieldArray[i].packData(data, 0);
        this.duel.broadcastPacket(WC_MONSTER_UPDATE, {playerIdx: this.idx, idx: i});
    }
},

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

//获取玩家随从
 Player.prototype.getMonster = function(idx) {return this.fieldArray[idx]; }

//获取玩家HP
Player.prototype.getHp = function() { return this.hp; }

module.exports = Player;

