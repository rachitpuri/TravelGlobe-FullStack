app.controller("HomeController", function ($scope, $rootScope, $interval, $timeout, ngToast, $http, $modal, $cookieStore, UserService, CityService) {

    $scope.options = {
        types: '(cities)'
    };

    $scope.$on('divButton:clicked', function (event, message) {
        console.log("message received");
        alert(message);
    })

    $rootScope.currentUser = null;

    $rootScope.currentUser = $cookieStore.get('loggedin');
    console.log($cookieStore.get('loggedin'));

    if ($rootScope.currentUser != null) {
        console.log("session saved");
        console.log($rootScope.currentUser);
        var user = $cookieStore.get('loggedin');
        $http.get("api/getuserImage/" +user)
            .success(function (response) {
                console.log(response);
                if(response.image != "")
                    $scope.userImage = "data:image/jpeg;base64," + btoa(response.image);
                else
                    $scope.userImage = '../img/user.png';
            })
            .error(function (err) {
                console.log(err);
            })
    } else {
        $rootScope.currentUser = null;
        console.log("session not saved");
    }

    $scope.logout = function () {
        console.log("calling logout");
        $http.post("/logout")
            .success(function () {
                $rootScope.currentUser = null;
                $cookieStore.put('loggedin', null);
            });
    };

    $scope.open = function (option) {
        console.log("open sign in form");
        var modalInstance = $modal.open({
            templateUrl: 'views/login/login.html',
            controller: 'loginController',
            resolve: {
                type: function () {
                    return option;
                }
            }
        });

        modalInstance.result.then(function (user) {
            $scope.userImage = "data:image/jpeg;base64," + btoa(user.image);
        });
    };
   
    $('.dropdown').hover(
        function () {
            $('.dropdown-menu', this).stop(true, true).fadeIn("fast");
            $('.caret-home').toggleClass("caret caret-up");
        },
        function () {
            $('.dropdown-menu', this).stop(true, true).fadeOut("fast");
            $('.caret-home').toggleClass("caret caret-up");
        });
   
    $scope.setCityID = function (details) {
        var cityId = details.place_id;
        CityService.setCityId(cityId);
        $cookieStore.put('cityID', cityId);
    };

    $scope.newCity1 = function () {
        app.config(function ($interpolateProvider) {
            $interpolateProvider.startSymbol('{{').endSymbol('}}');
        });

        app.filter('spaceless', function () {
            return function (input) {
                if (input) {
                    return input.replace(/\s+/g, '-');
                }
            }
        });
        var city = $scope.details;
        console.log(city);
    }

    $scope.setCityIDFixed = function (id) {
        console.log(id);
        $cookieStore.put('cityID', id);
    }
});
