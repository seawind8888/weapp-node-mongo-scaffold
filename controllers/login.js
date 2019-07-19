const request = require("request");
const jwt = require('jsonwebtoken') //创建token
const secret = 'appIdSessionId'
const mongoose = require("mongoose");
import config from '../config'


class Login {
  constructor() {}
  getAppId = ({
    appid = '',
    secret = '',
    code = ''

  }) => {
    return new Promise((resolve, reject) => {
      request.get({
          url: "https://api.weixin.qq.com/sns/jscode2session",
          json: true,
          qs: {
            grant_type: "authorization_code",
            appid: appid,
            secret: secret,
            js_code: code
          }
        },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            resolve(body);
          } else {
            reject();
          }
        }
      );
    });
  }
  loginAction = async (ctx) => {
    const resultData = await this.getAppId({
      appid: config.weapp.AppID,
      secret: config.weapp.AppSecret,
      code: ctx.query.code
    });

    // 引入小程序用户的model
    const WeChatUser = mongoose.model('User');
    await WeChatUser.findOne({
        openid: resultData.openid
      })
      .exec()
      .then(async result => {
        // 设置token
        let userToken = {
          openid: resultData.openid
        }
        // 已添加token
        if (result) {
          const token = result.token
          try {
            // token校验
            await jwt.verify(token, secret)
            ctx.body = {
              statusCode: 200,
              message: '登录成功',
              Token: token,
              sessionKey: resultData.session_key
            };
          } catch (err) {
            // token失效
            if (err && err.name == 'TokenExpiredError') {
              const token = jwt.sign(userToken, secret, {
                expiresIn: 60 * 60 * 24
              })
              // 更新token
              WeChatUser.updateOne(secret, token)
              ctx.body = {
                statusCode: 200,
                message: '登录成功',
                Token: token,
                sessionKey: resultData.session_key
              };
            } else {
              console.log('[tokenVerify]', error)
              ctx.body = {
                statusCode: 500,
                message: '服务器内部错误',
                data: error
              }
            };
          }
        } else {
          // 首次登录生成token, 有效期为24小时​
          const token = jwt.sign(userToken, secret, {
            expiresIn: 60 * 60 * 24
          })
          let NewWechatUser = new WeChatUser({
            openid: resultData.openid,
            token: token
          });
          await NewWechatUser.save().then(() => {
              //成功返回code=200，并返回成功信息
              ctx.body = {
                statusCode: 200,
                message: '登录成功',
                Token: token,
                sessionKey: resultData.session_key
              };
            })
            .catch(error => {
              //失败返回code=500，并返回错误信息 
              console.log('[tokenSave]', error)
              ctx.body = {
                statusCode: 500,
                message: '参数错误',
                data: error
              }
            });
        }
      });

  }
}

export default new Login()