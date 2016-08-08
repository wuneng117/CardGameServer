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
global.WC_PLAYER_ADD = 'WC_PLAYER_ADD';   //服务端向客户端发送PLAYER添加(自己)
global.WC_PLAYER_ADD_OTHER = 'WC_PLAYER_ADD_OTHER';   //服务端向客户端发送PLAYER添加(别人)
global.WC_PLAYER_UPDATE = 'CW_PLAYER_UPDATE';   //服务端向客户端发送PLAYER更新
