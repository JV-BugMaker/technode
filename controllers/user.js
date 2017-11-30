/**
 * user login logic 
 */

 var db = require('../models');
 var async = require('async');
 var gravatar = require('gravatar');

 exports.findUserById = function(_userId,callback){
    db.User.findOne({
        _id:_userId,
    },callback);
 };

 exports.findByEmailOrCreate = function(email,callback){
    db.User.findOne({
        email:email
    },function(err,user){
        if(user){
            callback(null,user);
        }else{
            user = new db.User;
            user.name = email.split('@')[0];
            user.email = email;
            user.avatarUrl = gravatar.url(email);
            //save and callback
            user.save(callback);
        }
    });
 };

//上线状态
exports.online = function(_userId,callback){
    db.User.findOneAndUpdate({
        _id:_userId
    },{
        $set:{
            online:true
        }
    },callback);
};

//下线操作
exports.offline = function(_userId,callback){
    db.User.findOneAndUpdate({
        _id:_userId
    },{
        $set:{
            online:false
        }
    },callback);
};
//获取在线用户列表
exports.getOnlineUsers = function(callback){
    db.User.find({
        online:true
    },callback);
};

//user enter room 
exports.joinRoom = function(join,callback){
    db.User.findOneAndUpdate({
        _id:join.user._id
    },{
        $set:{
            online:true,
            _roomId:join.room._id
        }
    },callback);
};


