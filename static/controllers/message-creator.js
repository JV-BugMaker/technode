angular.module('technodeApp').controller('MessageCreatorCtrl',function($scope,socket){
    $scope.newMessage = '';
    $scope.createMessage = function(){
        if($scope.newMessage == ''){
            return
        }
        // socket.emit('createMessage',$scope.newMessage)
        // $scope.newMessage = ''
        socket.emit('message.create',function(){
            message: $scope.newMessage,
            creator: $scope.me
        });
        $scope.newMessage = '';
    }
});


