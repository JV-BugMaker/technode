var express = require('express');
var app = express();
var path = require('path');


var port = process.env.port || 3000;

app.use(express.static(path.join(__dirname,'/static')));
app.use(function(req,res){
    res.sendFile(path.join(__dirname,'./static/index.html'));
});

var server = app.listen(port,function(){
    console.log('technode is on port'+ port + '!');
});

var io = require('socket.io').listen(server);

var messages = [];

io.sockets.on('connection',function(socket){
    socket.on('getAllMessages',function(){
        socket.emit('allMessages',messages);
    });

    socket.on('createMessage',function(message){
        messages.push(message);
        io.sockets.emit('messageAdded',message);
    });
});

//把登录接口暴露出来

var bodyParse = require('body-parse');
var cookieParse = require('cookie-parse');
var session = require('express-session');
var Controllers = require('./controllers');

app.use(bodyParse.json());
app.use(bodyParse.urlencode({
    extended:true,
}));

app.use(cookieParse());
app.use(session({
    secret:'technode',
    resave:true,
    saveUnititialized:false,
    cookie:{
        maxAge:60 * 1000
    }
}));

// api
app.get('/api/validate',function(req,res){
    var _userId = req.session._userId;
    if(_userId){
        Controllers.User.findUserById(_userId,function(err,user){
            if(err){
                res.json(401,{
                    msg:err
                });
            }else{
                res.json(user);
            }
        })
    }else{
        res.json(401,null);
    }
});

app.post('/api/login',function(req,res){
    var email = req.body.email;
    if(email){
        Controllers.User.findByEmailOrCreate(email,function(err,user){
            if(err){
                res.json(500,{
                    msg:err
                });
            }else{
                req.session._userId = user._id;
                res.json(user);
            }
        });
    }else{
        res.json(403);
    }
});

app.get('/api/logout',function(req,res){
    req.session._userId = null;
    res.json(401);
});

// socket.io 验证
var signedCookieParser = cookieParse('technode');
var MongoStore = require('connect-mongo')('session');
var sessionStore = new MongoStore({
    url:'mongodb://localhost/technode',
});

app.use(express.bodyParse());
app.use(express.cookieParse());
app.use(session({
    secret:'technode',
    resave:true,
    saveUnititialized:false,
    cookie:{
        maxAge:60 * 1000 * 60
    },
    store:sessionStore
}));

var server = app.listen(port,function(){
    console.log('technode is on port '+ port + '!');
});

var io = require('socket.io').listen(server);

//socket io 认证
io.set('authorization',function(handshakeData,accept){
    signedCookieParser(handshakeData,{},function(err){
        if(err){
            accept(err,false);
        }else{
            sessionStore.get(handshakeData.signedCookies['connect.sid'],function(err,session){
                if(err){
                    accept(err.message,false);
                }else{
                    handshakeData.session = session;
                    if(session._userId){
                        accept(null,true);
                    }else{
                        accept('No login');
                    }
                }
            });
        }
    });
});