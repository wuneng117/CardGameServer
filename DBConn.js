//dbjoon.js
global.LOGIN_ERROR_NOERROR = 0;
global.LOGIN_ERROR_NOTFOUND = 1;
global.LOGIN_ERROR_PASSWORD_ERROR = 2;

var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_user',
})

//账号查询 user:要查询的账号名称和密码， callback:回调函数（error:返回错误代码，user:查询成功的账号名称和密码）
exports.login = function login(user, callback) {
    //console.log('account query, account:%s, password:%s',user.AccountName, user.password);
    pool.query(
        {
            sql:'select accountname, password from t_account where t_account.AccountName=?',
            values: [user.AccountName],
        },
        function(err, rows, fields) {
            if(rows.length == 0)
            {
                error = LOGIN_ERROR_NOTFOUND;
            }
            else
            {
                for(var row of rows)
                {
                    //console.log('与要查询的账号名称一致的账号信息： account:%s, password:%s',row.AccountName,row.password);
                    if(row.password == user.password)
                    {                    
                        error = LOGIN_ERROR_NOERROR;   
                        break;                     
                    }
                    error = LOGIN_ERROR_PASSWORD_ERROR;
                }
            }

            //console.log('login query error:%d',error);
            callback(error, user);
        }
    );
};

