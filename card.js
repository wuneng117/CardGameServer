
function Card()
{
    this.player = null; //PLAYER引用
    this.idx = 0;       //数组索引

    this.cardName = '';
    this.critical = 0;
    this.atk = 0;
    this.hp = 0;
}

Card.prototype.init = function(cardData, player, idx)
{
    this.critical = cardData.critical;
    this.cardName = cardData.cardName;
    this.atk    = cardData.atk;
    this.hp     = cardData.hp;

    this.player = player;
    this.idx    = idx;
}

//打包数据完整
Card.prototype.packDataAll = function(data, hide)
{
    data.idx    = this.idx;
    data.hide   = hide;
    if(hide)
        return;
    
    data.cardName = this.cardName;
    data.critical = this.critical;
    data.atk    = this.atk;
    data.hp     = this.hp;
}


//解开数据完整
Card.prototype.unPackDataAll = function(data)
{
    this.idx = data.idx;
    
    this.cardName = data.cardName;
    this.critical = data.critical;
    this.atk    = data.atk;
    this.hp     = data.hp;
}

//打包数据
Card.prototype.packData = function(data, flag, hide)
{
    data.flag   = flag;
    data.idx    = this.idx;
    data.hide   = hide;
    if(hide)
        return;

    if(flag & CARD_UPDATE_CARDNAME)
        data.cardName = this.cardName;
    if(flag & CARD_UPDATE_CRITICAL)
        data.critical = this.critical;
    if(flag & CARD_UPDATE_ATK)
        data.atk = this.atk;
    if(flag & CARD_UPDATE_HP)
        data.hp = this.hp;    
}


//解开数据
Card.prototype.unPackData = function(data)
{
    var flag = data.flag;
    this.idx = data.idx;
    
    if(flag & CARD_UPDATE_CARDNAME)
        this.cardName = data.cardName;
    if(flag & CARD_UPDATE_CRITICAL)
        this.critical = data.critical;
    if(flag & CARD_UPDATE_ATK)
        this.atk = data.atk;
    if(flag & CARD_UPDATE_HP)
        this.hp = data.hp;  
}

module.exports = Card;