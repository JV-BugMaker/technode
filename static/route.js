//将路由配置引入进来 此文件必须引入到index.html文件中
angular.module('technodeApp').config(function($routeProvider,$locationProvider){
    //修正书中问题
    $locationProvider.html5Mode({
        enable:true,
        requireBase:false, //1.3版本问题
    });
    $routeProvider.when('/',{
        templateUrl:'/pages/room.html',
        controller:'RoomCtrl',  //指定控制器 逻辑
    }).when('/login',{
        templateUrl:'/pages/login.html',
        controller:'LoginCtrl',  //逻辑尚未开始
    }).otherwise({
        redirectTo:'/login', 
    });
});