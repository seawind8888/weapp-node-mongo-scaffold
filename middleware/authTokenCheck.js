import jwt from 'jsonwebtoken'
const secret = 'appIdSessionId' //生成Token 的秘钥

export default async function (ctx, next) {
  // if(ctx.path === "/user/login") {
  //   await next()
  // } else {
    let token = ctx.header.authorization.split(' ')[1]
    if (token) {
      try {
        await jwt.verify(token, secret)
  
      } catch (err) {
        if (err) throw err;
        ctx.body = {
          statusCode: 500,
          message: '服务器内部错误'
        };
      }
    } else {
      if (err) throw err;
      ctx.body = {
        statusCode: 401,
        message: '未识别token'
      };
    }
    await next()
  // }
 
}