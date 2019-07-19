import Koa from 'koa';
import Router from 'koa-router'
import cors from 'koa2-cors'
import bodyParser from 'koa-bodyparser'
import mongoose from 'mongoose'
import jwtKoa from 'koa-jwt'//验证token
import fs from 'fs'
import path from 'path'
import userRoutes from './routes/user.js'
import homeRoutes from './routes/home.js'
import config from './config'
import errorHandle from './middleware/errorHandle'
// import authTokenCheck from './middleware/authTokenCheck'

const app = new Koa();
const secret =  'appIdSessionId' //生成Token 的秘钥
const models = path.join(__dirname, './models');
const router = new Router();


mongoose.Promise = Promise
mongoose.connect(`mongodb://localhost:27017/koa2Wechat`, { useNewUrlParser: true });


// app.use(authTokenCheck);


// 遍历引入mongo
fs.readdirSync(models)
  .filter(file => ~file.search(/^[^.].*\.js$/))
  .forEach(file => require(path.join(models, file)));

app.use(errorHandle)
  .use(cors())
  .use(bodyParser())
  //全局路由除了path 以外都需要携带token去请求
  .use(jwtKoa({secret:secret}).unless({
    path: config.app.whiteList
}))



//二级路由 http://localhost:3000/wechatUser
router.use('/user',userRoutes.routes())
router.use('/home',homeRoutes.routes())
app.use(router.routes())
app.use(router.allowedMethods())

// 连接mongoDB


app.listen(config.app.port, () => console.log(`[Server] starting at port ${config.app.port}`))