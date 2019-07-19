const mongoose = require('mongoose');
const Schema = mongoose.Schema
//创建我们的用户Schema
const UserSchema = new Schema({
    openid: String,
    nickName: String,
    avatarUrl: String,
    createAt: {
        type: Date,
        default: Date.now()
    },
    updateAt: {
        type: Date,
        default: Date.now()
    },
    token: String
})


module.exports = mongoose.model('User', UserSchema);