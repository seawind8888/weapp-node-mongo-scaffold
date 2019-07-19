import request from "request";
import jwt from 'jsonwebtoken'; //创建token
import mongoose from "mongoose";
import WXBizDataCrypt from '../utils/WXBizDataCrypt'
import config from '../config'

const secret = 'appIdSessionId';


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
    // 调用/user/login
    const {
      encryptedData,
      code,
      iv
    } = ctx.query
    const {
      AppID,
      AppSecret
    } = config.weapp
    // 开始获取openId && session_key
    const resultData = await this.getAppId({
      appid: AppID,
      secret: AppSecret,
      code: code
    });
    // 解密微信签名，获取用户信息
    const decode = new WXBizDataCrypt(AppID, resultData.session_key)
    const userInfo = decode.decryptData(encryptedData, iv)

    // 引入小程序用户的model
    const WeChatUser = mongoose.model('User');
    
    // 查询用户信息
    await WeChatUser.findOne({
        openid: resultData.openid
      })
      .exec()
      .then(async result => {
       
        // 设置token格式
        const userToken = {
          openid: resultData.openid
        }
        if (!result) {
          // 首次登录生成token, 有效期为24小时​
          const token = jwt.sign(userToken, secret, {
            expiresIn: 60 * 60 * 24
          })
          const NewWechatUser = new WeChatUser({
            // 用户信息入库
            avatar: userInfo.avatarUrl,
            nickName: userInfo.nickName,
            openid: resultData.openid,
            token: token
          });
          try {
            const _save = await NewWechatUser.save()
            console.log('[mongoSave]', _save)
               //成功返回code=200，并返回成sessionKey
            ctx.body = {
              statusCode: 200,
              message: '登录成功, 用户信息入库成功',
              Token: token,
              sessionKey: resultData.session_key
            };
          } catch (error) {   //失败返回code=500，并返回错误信息 
            console.log('[tokenSave]', error)
            ctx.body = {
              statusCode: 500,
              message: '参数错误',
              data: error
            }
          }
           
        } else { // 已添加token
          const token = result.token
          try {
            // token校验
            await jwt.verify(token, secret)
            ctx.body = {
              statusCode: 200,
              message: '登录成功，用户已入库',
              Token: token,
              sessionKey: resultData.session_key
            };
          } catch (err) {
            if (err && err.name == 'TokenExpiredError') {
               // token失效
              const token = jwt.sign(userToken, secret, {
                expiresIn: 60 * 60 * 24
              })
              // 更新token
              
              const _update = WeChatUser.updateOne(secret, token)
              console.log('[mongoUpdate]', _update)
              ctx.body = {
                statusCode: 200,
                message: '登录成功，Token更新成功',
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
        }
      });
  }
}

export default new Login()