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
      success: loginRes => {
        wx.getUserInfo({
          success: userRes => {
            wx.request({
              url: 'http://localhost:3008/user/login',
              data: {
                code: loginRes.code,
                encryptedData: userRes.encryptedData,
                iv: userRes.iv,
                userInfo: userRes.userInfo
              },
              success (res) {
                const {data} = res
                wx.showModal({
                  title: '登录成功',
                  content: data.message
                })
                wx.setStorageSync('TOKEN', data.Token);
                app.globalData.userInfo = userRes.userInfo
                _self.setData({
                  userInfo: userRes.userInfo,
                  hasUserInfo: true
                })
              }
            })
          }
        })
      }
    })
  }
})
