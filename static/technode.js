//申请对应关系  run block用来做登录logic
/**
 * run block 模块作为第一个执行的模块 做登录判断逻辑
 * $http 是一个ajax组件
 * $rootScope.me 全局变量 me
 * $location 组件
 */
angular.module('technodeApp',['ngRoute']).run(function($window,$rootScope,$http,$location){
    $http({
        url:'/api/validate',
        method:'GET',
    }).success(function(user){
        $rootScope.me = user;
        $location.path('/');
    }).error(function(datas){
        $location.path('/login');
    });

    $rootScope.logout = function(){
        $http({
            url:'/api/logout',
            method:'GET',
        }).success(function(){
            $rootScope.me = null;
            $location.path('/login');
        });
    };
    //调用链 触发on事件
    $rootScope.$on('login',function(evt,me){
        $rootScope.me = me;
    });
});
