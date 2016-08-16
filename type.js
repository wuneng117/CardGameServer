//回合阶段
global.PHASE_NULL = 0;
global.PHASE_BEGIN_TURN = 1;
global.PHASE_MAIN_TURN = 2;
global.PHASE_END_TURN = 3;

//客户端与服务端通信函数

//登录
global.WC_CONNECTED = 'WC_CONNECTED';           //服务端向客户端发送连接响应
global.CW_LOGIN_REQUEST = 'CW_LOGIN_REQUEST';   //客户端向服务端发送登录请求
global.WC_LOGIN_RESPONSE = 'WC_LOGIN_RESPONSE'; //服务端向客户端发送登录响应
global.CW_ENTERROOM_REQUEST = 'CW_ENTERROOM_REQUEST';   //客户端向服务端发送进入房间请求
global.WC_ENTERROOM_RESPONSE = 'WC_ENTERROOM_RESPONSE'; //服务端向客户端发送进入房间响应

//聊天
global.CW_CHAT_ADD_REQUEST = 'CW_CHAT_ADD_REQUEST';     //客户端向服务端发送聊天信息请求
global.WC_CHAT_ADD_RESPONSE = 'WC_CHAT_ADD_RESPONSE';   //服务端向客户端发送聊天信息响应
global.WC_CHAT_ADD = 'WC_CHAT_ADD';                     //服务端向客户端发送聊天信息

//Player
global.WC_PLAYER_ADD = 'WC_PLAYER_ADD';                 //服务端向客户端发送PLAYER添加(自己)
global.WC_PLAYER_ADD_OTHER = 'WC_PLAYER_ADD_OTHER';     //服务端向客户端发送PLAYER添加(别人)
global.WC_PLAYER_UPDATE = 'WC_PLAYER_UPDATE';           //服务端向客户端发送PLAYER更新

//房间
global.CW_DUELREADY_REQUEST = 'CW_DUELREADY_REQUEST';       //客户端向服务端发送准备开始游戏请求
global.WC_DUELREADY_RESPONSE = 'WC_DUELREADY_RESPONSE';     //服务端向客户端发送准备开始游戏响应
global.WC_DUELREADY = 'WC_DUELREADY';   //服务端给客户端发送用户准备

//手牌
global.WC_HANDCARD_UPDATE = 'WC_HANDCARD_UPDATE';    //手牌更新
global.WC_HANDCARD_CREATE = 'WC_HANDCARD_CREATE';    //手牌创建
global.WC_HANDCARD_DELETE = 'WC_HANDCARD_DELETE';    //手牌删除

//随从
global.CW_MONSTER_SUMMON_REQUEST = 'CW_MONSTER_SUMMON_REQUEST';        //客户端向服务端发送召唤随从请求
global.WC_MONSTER_SUMMON_RESPONSE = 'WC_MONSTER_SUMMON_RESPONSE';      //服务端向客户端发送召唤随从响应
global.CW_MONSTER_ATTACKMONSTER_REQUEST = 'CW_MONSTER_ATTACKMONSTER_REQUEST';        //客户端向服务端发送随从攻击随从请求
global.WC_MONSTER_ATTACKMONSTER_RESPONSE = 'WC_MONSTER_ATTACKMONSTER_RESPONSE';      //服务端向客户端发送随从攻击随从响应
global.CW_MONSTER_ATTACKPLAYER_REQUEST = 'CW_MONSTER_ATTACKPLAYER_REQUEST';        //客户端向服务端发送随从攻击玩家请求
global.WC_MONSTER_ATTACKPLAYER_RESPONSE = 'WC_MONSTER_ATTACKPLAYER_RESPONSE';      //服务端向客户端发送随从攻击玩家响应
global.WC_MONSTER_CREATE = 'WC_MONSTER_CREATE'; //随从创建
global.WC_MONSTER_UPDATE = 'WC_MONSTER_UPDATE'; //随从更新
global.WC_MONSTER_DELETE = 'WC_MONSTER_DELETE'; //随从删除

//结束回合
global.CW_ENDPHASE_REQUEST = 'CW_ENDPHASE_REQUEST';   //客户端向服务端发送回合结束请求
global.WC_END_PHASE_RESPONSE = 'WC_END_PHASE_RESPONSE'; //服务端向客户端发送回合结束响应