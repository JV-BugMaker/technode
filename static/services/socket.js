//factory 一个请求对应一个连接
angular.module('technodeApp').factory('socket',function($rootScope){
    var socket = io.connect('/');
    return {
        on: function(eventName,callback){
            socket.on(eventName,function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    callback.apply(socket,args);
                });
            });
        },
        emit:function(eventName,data,callback){
            socket.emit(eventName,data,function(){
                var args = arguments;
                //执行callbak 
                $rootScope.$apply(function(){
                    if(callback){
                        callback.apply(socket,args);
                    }
                });
            });
        }
    };
});