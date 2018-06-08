var app = angular.module('mainApp', ["ngResource","ngRoute","ngCookies"]);

app.controller('loginController', 
  function($scope, $resource, $http, $httpParamSerializer, $cookies) {
     
    $scope.credentials = {
        grant_type: "password", 
        username: "", 
        password: "", 
        client_id: "2",
        client_secret: "Admin_Production",
        scope: ""
    };
     
    $scope.submit = function() {  
      $http({
        method: 'POST',
        url: 'http://api.iss.stilldesign.work/oauth/token',
        data: $scope.credentials,
        headers: { 
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
        $http.defaults.headers.common.Authorization = 'Bearer ' + resp.data.access_token;
        $cookies.put("access_token", resp.data.access_token);
        $cookies.put("refresh_token", resp.data.refresh_token);
        
        window.location.href = "users.html";
      }, function(resp){
        showError(resp);
      }); 
        
    };    
});

app.controller('usersAdminController', 
  function($scope, $resource, $http, $httpParamSerializer, $cookies) {
    access_token = $cookies.get("access_token");
    
    $scope.userList = [];
    $scope.user = {
      id:"",
      email:"",
      phone:"",
      name:"",
      active:""
    };
        
    $scope.getUsers = function() {  
      $http({
        method: 'GET',
        url: 'http://api.iss.stilldesign.work/admin/user',
        headers: { 
          'Authorization' : 'Bearer '+access_token,
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
        $scope.userList = resp.data.data;
      }, function(resp){
        showError(resp);
      }); 
    };    
    
    $scope.submitNew = function() {  
      $http({
        method: 'POST',
        url: 'http://api.iss.stilldesign.work/admin/user',
        data: $scope.user,
        headers: { 
          'Authorization' : 'Bearer '+access_token,
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
        window.location.href = "users.html";
      }, function(resp){
        if (resp.data.message){
          if (resp.data.message.indexOf('SQLSTATE')>-1){    //handle sql state error
            window.location.href = "users.html";
          }else{
            showError(resp);
          }
        }else{
          showError(resp);
        }
      }); 
    };    
    
    $scope.openEditUser = function(id){
      window.location.href = 'editUser.html?id='+id;      
    };
  
    $scope.editUser = function() { 
      id = window.location.search.replace('?id=','');
      $http({
        method: 'GET',
        url: 'http://api.iss.stilldesign.work/admin/user/'+id,
        headers: { 
          'Authorization' : 'Bearer '+access_token,
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
        $scope.user = resp.data.data;
        $scope.user.active = true;    //set active flag default value
      }, function(resp){
        showError(resp);
      }); 
    };    
  
    $scope.submitEdit = function() { 
      $http({
        method: 'PUT',
        url: 'http://api.iss.stilldesign.work/admin/user/'+$scope.user.id,
        data: $scope.user,
        headers: { 
          'Authorization' : 'Bearer '+access_token,
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
        window.location.href = "users.html";
      }, function(resp){
        showError(resp);
      }); 
      
    
    };
      
    $scope.deleteUser = function(id) { 
      if (confirm('Biztos, hogy törli a(z) ('+id+') azonosítójú felhasználót?')==false) {
        return;
      }
      
      $http({
        method: 'DELETE',
        url: 'http://api.iss.stilldesign.work/admin/user/'+id,
        data: $scope.user,
        headers: { 
          'Authorization' : 'Bearer '+access_token,
          'Content-Type': 'application/json' 
        }
      }).then(function(resp){
          
        window.location.href = "users.html";
      }, function(resp){
        showError(resp);
      }); 
    
    
    };
});

function showError(err){
  var mess = err.data.errors;
  alert(JSON.stringify(mess));  
}

  