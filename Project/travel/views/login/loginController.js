app.controller("loginController", function ($scope, $rootScope, $timeout, $http, $modalInstance, $cookieStore, type, UserService, CityService) {

    $scope.login_error = false;
    $scope.signup_error = false;

    if (type == 'signIn') 
        $scope.signUpClicked = false;
    else 
        $scope.signUpClicked = true;
    
    
    $scope.toggle = function (option) {
        if (option == 'signIn') {
            console.log("signIn");
            $scope.signUpClicked = false;
            $('.signUp-header').css('background-color', 'white');
            $('.signIn-header').css('background-color', 'lightgray');
        }
        else {
            console.log("signUp");
            $scope.signUpClicked = true;
            $('.signUp-header').css('background-color', 'lightgray');
            $('.signIn-header').css('background-color', 'white');
        }
    }

    $scope.signIn = function () {
        
        var user = {
            email: $scope.email,
            password: $scope.password
        };
        console.log(user);
        $http.post("/login", user)
            .success(function (response) {
                $rootScope.currentUser = response.username;
                UserService.setUser(response);
                var username = response.username;
                $cookieStore.put('loggedin', username);
                $modalInstance.close(response);
            })
            .error(function (response) {
                console.log("error in login");
                $scope.login_error = true;
            });
    };

    $scope.focused = function () {
        console.log("loosing focus");
        $scope.login_error = false;
        $scope.signup_error = false;
    }

    $scope.signUp = function () {

        var newuser = {
            username: $scope.username,
            email: $scope.email,
            password: $scope.password
        };

        console.log(newuser);
        $http.post("api/signup", newuser)
            .success(function (response) {
                var user = {
                    email: $scope.email,
                    password: $scope.password
                };
                console.log(response);
            $http.post("/login", user)
                .success(function (response) {
                    $rootScope.currentUser = response.username;
                    UserService.setUser(response);
                    var username = response.username;
                    console.log(username);
                    $cookieStore.put('loggedin', username);
                    $scope.password = "";
                    $scope.email = "";
                    $modalInstance.close(response);
                    })
                })
            .error(function (err) {
                console.log(err);
                $scope.signup_error = true;
            })
    };

});