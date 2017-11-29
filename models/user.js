//user.js
/**
 * define user schema
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema

var User = new Schema({
    email:String,
    name:String,
    avatarUrl:String,
    _roomId:ObjectId,
    online:Boolean,
});

module.exports = User;