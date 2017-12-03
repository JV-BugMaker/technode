angular.module('technodeApp').controller('RoomCtrl',function($scope,socket){
    $scope.messages = [];
    socket.emit('getAllMessages');

    socket.on('allMessages',function(messages){
        $scope.messages = messages;
    });

    socket.on('messageAdded',function(message){
        $scope.messages.push(message);
    });

    socket.on('roomData',function(room){
        $scope.room = room
    });

    socket.emit('getRoom');

    socket.on('online',function(user){
        $scope.room.users.push(user);
    });

    socket.on('offline',function(user){
        var _userId = user._id;
        $scope.room.users = $scope.room.users.filter(function(user){
            return user._id != _userId;
        });
    });

    socket.on('joinRoom',function(join){
        $scope.room.users.push(join.user);
    });

    $scope.$on('$routeChangeStart',function(){
        socket.emit('leaveRoom',{
            user:$scope.me,
            room:$scope.room
        });

        socket.on('leaveRoom',function(leave){
            _userId:leave.user._id,
            $scope.room.users = $scope.room.users.filter(function(user){
                return user._id != _userId;
            });
        });
    });
});



