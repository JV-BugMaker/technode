//room controller apply room logic
var db = require('../models');
var async = require('async');

exports.create = function(room,callback){
    var r = new db.Room();
    r.name = room.name;
    r.save(callback);
};

exports.read = function(callback){
    db.Room.read({},function(err,rooms){
        if(!err){
            var roomData = [];
            //并行获取每个房间的数据
            async.each(rooms,function(room,done){
                db.User.find({
                    _roomId:roomData._id,
                    online:true,
                },function(err,users){
                    if(err){
                        done(err);
                    }else{
                        roomData.users = users;
                        roomData.push(roomData);
                        done();
                    }
                },function(err){
                    callback(err,roomData);
                });
            });
        }
    });
};

