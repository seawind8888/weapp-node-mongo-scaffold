//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
  },
  getLoginInfo: function(e) {
       wx.request({
          url: 'http://localhost:3008/home/test',
          header: {
            authorization: 'Bearer ' + wx.getStorageSync('TOKEN')
          },
          success (resp) {
            console.log(resp)
            if(resp.statusCode === 200) {
              wx.showToast({
                title: '获取成功',
              })
            } else {
              wx.showToast({
                title: '请先登录',
                icon: 'none'
              })
            }
          },
          fail () {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            })
          }
        })
  },
  getUserInfo: function(e) {
    const _self = this
     wx.login({
      success: res => {
        wx.request({
          url: 'http://localhost:3008/user/login',
          data: {
            code: res.code
          },
          success (res) {
            const {data} = res
            wx.showToast({
              title: '登录成功'
            })
            wx.setStorageSync('TOKEN', data.Token);
            wx.getUserInfo({
                  success: res => {
                    app.globalData.userInfo = res.userInfo
                    _self.setData({
                      userInfo: res.userInfo,
                      hasUserInfo: true
                    })
                  }
                })
         
            // const {data} = res
            // wx.setStorageSync('SESSION_KEY', data.sessionKey);
          }
        })
      }
    })
  }
})
