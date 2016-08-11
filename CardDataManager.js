const CardData = require('CardData')

var cardDataTest =
[
    ["a",0,1,1],
    ["b",1,1,3],
    ["c",1,2,1],
    ["d",2,2,3],
    ["e",2,3,2],
    ["f",2,4,1],
    ["g",2,1,4],
    ["h",3,2,4],
    ["i",3,5,1],
    ["j",3,3,3],
    ["k",3,4,2],
    ["l",4,3,5],
    ["m",4,5,2],
    ["n",4,4,4],
    ["o",4,2,6],
    ["p",4,1,7],
    ["q",5,3,6],
    ["r",5,4,5],
    ["s",5,5,4],
    ["t",5,5,5],
    ["u",5,6,2],
    ["v",5,6,3],
    ["w",6,3,8],
    ["x",6,4,6],
    ["y",6,5,6],
    ["z",6,6,6],
    ["A",6,6,5],
    ["B",6,7,3],
    ["C",6,8,1],
    ["D",7,7,7],
    ["E",7,4,8],
    ["F",7,6,8],
    ["G",7,7,7],
    ["H",8,8,8],
    ["I",8,7,9],
    ["J",8,9,6],
    ["K",9,9,9],
    ["L",10,12,12]
];

function CardDataManager()
{
    this.cardMap = {};
}

CardDataManager.prototype.init = function()
{
    for(var i in cardDataTest)
    {
        var card = new CardData();
        card.cardName = cardDataTest[i][0];
        card.critical = cardDataTest[i][1];
        card.atk = cardDataTest[i][2];
        card.hp = cardDataTest[i][3];
        this.cardMap[card.cardName] = card;
    }
}

module.exports = CardDataManager;