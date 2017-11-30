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
                //增加个人的是否在线的状态显示
                Controllers.User.online(user._id,function(err,user){
                    if(err){
                        res.json(500,{
                            msg:err,
                        });
                    }else{
                        res.json(user);
                    }
                });
                res.json(user);
            }
        });
    }else{
        res.json(403);
    }
});

app.get('/api/logout',function(req,res){
    var _userId = req.session._userId;
    req.session._userId = null;
    Controllers.User.offline(_userId,function(err,user){
        if(err){
            res.json(500,{
                msg:err
            });
        }else{
            res.json(200);
            //删除信息
            delete req.session._userId;
        }
    });
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

io.sockets.on('connection',function(socket){
    var _userId = socket.handshakeData.session._userId;
    Controllers.User.online(_userId,function(err,user){
        if(err){
            socket.emit('err',{
                msg:err
            });
        }else{
            socket.broadcast.emit('online',user);
            //添加系统消息 走消息事件
            socket.broadcast.emit('messageAdded',{
                connent:user.name+'进入聊天室',
                creator:SYSTEM,
                createAt:Date.now,
            });
        }
    });
    socket.on('getRoom',function(){
        //并行获取db数据
        async.parallel([
            function(done){
                Controllers.User.getOnlineUsers(done);
            },
            function(done){
                Controllers.Message.read(done);
            }
        ],function(err,result){
            if(err){
                socket.emit('err',{
                    msg:err
                });
            }else{
                socket.emit('roomData',{
                    users:result[0],
                    messages:result[1],
                });
            }
        });
        // Controllers.User.getOnlineUsers(function(err,users){
        //     if(err){
        //         socket.emit('err',{
        //             msg:err
        //         });
        //     }else{
        //         socket.emit('roomData',{
        //             users:users,
        //             message:messages
        //         });
        //     }
        // });
    });
    socket.on('createMessage',function(message){
        // messages.push(message);
        // io.sockets.emit('messageAdded',message);
        Controllers.Message.create(function(err,message){
            if(err){
                socket.emit('err',{
                    msg:err
                });
            }else{
                io.sockets.emit('messageAdded',message);
            }
        });
    });

    socket.on('disconnect',function(){
        Controllers.User.offline(_userId,function(err,user){
            if(err){
                socket.emit('err',{
                    msg:err
                });
            }else{
                socket.broadcast.emit('offline',user);
                //添加系统消息 走消息事件 广播消息
                socket.broadcast.emit('messageAdded',{
                    connent:user.name+'离开聊天室',
                    creator:SYSTEM,
                    createAt:Date.now,
                });
            }
        });
    });
});

// create room logic 
socket.on('createRoom',function(room){
    Controllers.Room.create(room,function(err,room){
        if(err){
            socket.emit('err',{
                msg:err
            });
        }else{
            io.sockets.emit('roomAdded',room);
        }
    });
});

//get all rooms list
socket.on('getAllRooms',function(data){
    if(data && data._roomId){
        Controllers.Room.getById(data._roomId,function(err,room){
            if(err){
                socket.emit('err',{
                    msg:err
                });
            }else{
                socket.emit('roomData.'+data._roomId,room);
            }
        });
    }else{
        Controllers.Room.read(function(err,rooms){
            if(err){
                socket.emit('err',{
                    msg:err
                });
            }else{
                io.sockets.emit('roomsData',rooms);
            }
        });
    }
    
});

socket.on('joinRoom',function(join){
    Controllers.User.joinRoom(join,function(err){
        if(err){
            socket.emit('err',{
                msg:err
            });
        }else{
            socket.join(join.room._id);
            socket.emit('joinRoom.'+join.user._id,join);
            socket.in(join.room._id).broadcast.emit('messageAdded',{
                content:join.user.name + '进入房间',
                creator:SYSTEM,
                createAt:{
                    type:Date,
                    default:Date.now()
                },
                _id:ObjectId()
            });
            socket.in(join.room._id).broadcast.emit('joinRoom',join);
        }
    });
});