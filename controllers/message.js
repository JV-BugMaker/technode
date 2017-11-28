//message controller logic
var db = require('../models');

//create message  save to db
exports.create = function(message,callback){
    var message = new db.Message();
    message.content = message.content;
    message.creator = message.creator;
    message.save(callback);
};

//read message from db
exports.read = function(callback){
    db.Message.findAll({},null,{
        sort:{
            'createAt':-1
        },
        limit:20
    },callback);
};