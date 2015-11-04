var app = angular.module("Travel", ['ngAutocomplete', 'ngRoute', 'ui.bootstrap', 'ngCookies', 'ngToast', 'infinite-scroll', 'dcbImgFallback']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
     when('/home', {
         templateUrl: 'views/home/home.html',
         controller: 'HomeController'
     }).
     when('/messages/:username', {
         templateUrl: 'views/message/messages.html',
         controller: 'MessageController',
         resolve: {
             loggedin: checkLoggedin
         }
     }).
    when('/messagelist/:username', {
        templateUrl: 'views/messageDetails/messageDetails.html',
        controller: 'MessageDetailController',
        resolve: {
            loggedin: checkLoggedin
        }
    }).
    when('/profile/:username', {
        templateUrl: 'views/profile/profile.html',
        controller: 'ProfileController'
    }).
    when('/dashboard', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashBoardController',
        resolve: {
            loggedin: checkLoggedin
        }
    }).
    when('/destination/:city/:lat/:lon', {
        templateUrl: 'views/city/city.html',
        controller: 'CityController'
    }).
    when('/destination/:city/:lat/:lon/UserReview', {
        templateUrl: 'views/review/review.html',
        controller: 'ReviewController'
    }).
    when('/destination/:city/:lat/:lon/poi/:query', {
        templateUrl: 'views/poi/poi.html',
        controller: 'PointOfInterestController'
    }).
     otherwise({
         redirectTo: '/home'
     });
}]);

var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get('/loggedin')
        .success(function (user) {
            $rootScope.errorMessage = null;
            // User is Authenticated
            if (user !== '0') {
                $rootScope.currentUser = user;
                deferred.resolve();
            }
                // User is Not Authenticated
            else {
                $rootScope.errorMessage = 'You need to log in.';
                deferred.reject();
                $location.url('/login');
            }
        });

    return deferred.promise;
};

app.factory("CityService", function ($http, $cookieStore, $rootScope, UserService) {
    var cityId = null;

    var setCityId = function (id) {
        cityId = id;
        console.log("setting id:" + cityId);
    };

    //var login = function (result) {
    //    console.log("login in service");
    //    console.log(result);
    //    var user = {
    //        email: result.email,
    //        password: result.password
    //    };
    //    console.log(user);
    //    $http.post("/login", user)
    //    .success(function (response) {
    //        $rootScope.currentUser = response.username;
    //        UserService.setUser(response);
    //        var username = response.username;
    //        console.log(username);
    //        $cookieStore.put('loggedin', username);
    //        password = "";
    //        email = "";
    //    })
    //    .error(function (response) {
    //        console.log("error in login");
    //    });
    //};

    //var getCurrentUser = function () {
    //    return $cookieStore.get('loggedin');
    //}

    var getCityId = function () {
        return cityId;
    };
    
    return {
        setCityId: setCityId,
        getCityId: getCityId
    };
});

app.factory("UserService", function ($http) {
    var currentUser = null;

    var setUser = function (user) {
        currentUser = user;
        console.log("setUser called");
        console.log(currentUser);
    }

    var getUser = function () {
        return currentUser;
    }

    return {
        setUser: setUser,
        getUser: getUser
    };

});



