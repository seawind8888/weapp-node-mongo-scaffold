class Home {
    constructor() {}
    test = (ctx) => {
        ctx.body = {
            statusCode: 200,
            message: '获取鉴权数据成功'
          }
    }
}
export default new Home()