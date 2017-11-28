//消息持久化 message schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Message = new Schema({
    content:String,
    creator:{
        _id:ObjectId,
        email:String,
        name:String,
        avatarUrl:String,
    },
    createAt:{
        type:Date,
        default:Date.now,
    }
});

module.exports = Message;
