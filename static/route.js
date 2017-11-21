//将路由配置引入进来
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
        controller:'LoginCtrl',
    }).otherwise({
        redirectTo:'/login', 
    });
});