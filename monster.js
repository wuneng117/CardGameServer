var MONSTER_UPDATE_CARDNAME = 1<<1;
var MONSTER_UPDATE_CRITICAL = 1<<2;
var MONSTER_UPDATE_ATK = 1<<3;
var MONSTER_UPDATE_HP = 1<<4;
var MONSTER_UPDATE_MAXHP = 1<<5;
var MONSTER_UPDATE_ISATKED = 1<<6;


function Monster()
{
    this.player = null;
    this.idx = -1;

    this.cardName = '';
    this.critical = 0;
    this.atk = 0;
    this.hp = 0;
    this.maxHp = 0;
    this.isAtked = true;
}

Monster.prototype.init = function(card, player, idx)
{
    this.cardName = card.cardName;
    this.critical = card.critical;
    this.atk = card.atk;
    this.hp = card.hp;
    this.maxHp = card.hp;
    
    this.player = player;
    this.idx = idx;        
}

//打包数据完整
Monster.prototype.packDataAll = function(data)
{
    data.idx = this.idx;
    
    data.cardName = this.cardName;
    data.critical = this.critical;
    data.atk = this.atk;
    data.hp = this.hp;
    data.maxHp = this.maxHp;
    data.isAtked = this.isAtked;
}

//解开数据完整
Monster.prototype.unPackDataAll = function(data)
{
    this.idx = data.idx;
    
    this.cardName = data.cardName;
    this.critical = data.critical;
    this.atk = data.atk;
    this.hp = data.hp;
    this.maxHp = data.maxHp;
    this.isAtked = data.isAtked;
}

//打包数据
Monster.prototype.packData = function(data, flag)
{
    data.flag = flag;
    data.idx = this.idx;

    if(flag & MONSTER_UPDATE_CARDNAME)
        data.cardName = this.cardName;
    if(flag & MONSTER_UPDATE_CRITICAL)
        data.critical = this.critical;
    if(flag & MONSTER_UPDATE_ATK)
        data.atk = this.atk;
    if(flag & MONSTER_UPDATE_HP)
        data.hp = this.hp;    
    if(flag & MONSTER_UPDATE_MAXHP)
        data.maxHp = this.maxHp;
    if(flag & MONSTER_UPDATE_ISATKED)
        data.isAtked = this.isAtked;
}


//解开数据
Monster.prototype.unPackData = function(data)
{
    var flag = data.flag;
    this.idx = data.idx;

    if(flag & MONSTER_UPDATE_CARDNAME)
        this.cardName = data.cardName;
    if(flag & MONSTER_UPDATE_CRITICAL)
        this.critical = data.critical;
    if(flag & MONSTER_UPDATE_ATK)
        this.atk = data.atk;
    if(flag & MONSTER_UPDATE_HP)
        this.hp = data.hp;    
    if(flag & MONSTER_UPDATE_MAXHP)
        this.maxHp = data.maxHp;
    if(flag & MONSTER_UPDATE_ISATKED)
        this.isAtked = data.isAtked;
}

//扣除HP
Monster.prototype.reduceHp = function(num) 
{
    if(num <= 0)
        return;
    
    this.hp -= num;
    //死了就杀掉这个随从
    if(this.isDead())
    {
        this.player.killMonster(this.idx);
        this.player.getDuel().broadcastPacket(WC_CHAT_ADD, {message: this.player.getPlayerName() + ' 的随从 ' + this.cardName + ' 死亡了',
                        isSystem: true});
    }
    else
    {
        var data = {};
        this.packData(data, MONSTER_UPDATE_HP);
        this.player.getDuel().broadcastPacket(WC_MONSTER_UPDATE, {playerIdx: this.player.getIdx(), param: data});
    }
}

//回复HP
Monster.prototype.addHp = function(num) 
{
    if(num <= 0)
        return;
        
    this.hp+= num;
    if(this.hp > this.maxHp)
        this.hp = this.maxHp;
    
    var data = {};
    this.packData(data, MONSTER_UPDATE_HP);
    this.player.getDuel().broadcastPacket(WC_MONSTER_UPDATE, {playerIdx: this.player.getIdx(), param: data});
}

Monster.prototype.isDead = function() 
{
    if(this.hp <= 0)
        return true;
    else
        return false;
}


//设置编号
Monster.prototype.setIdx = function(idx) { this.idx = idx; }
//设置攻击标志
Monster.prototype.setAtked = function(isAtked) 
{
    this.isAtked = isAtked; 

    var data = {};
    this.packData(data, MONSTER_UPDATE_ISATKED);
    this.player.getDuel().broadcastPacket(WC_MONSTER_UPDATE, {playerIdx: this.player.getIdx(), param: data});
}

module.exports = Monster;
