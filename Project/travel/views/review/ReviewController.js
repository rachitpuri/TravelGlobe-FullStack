app.controller("ReviewController", function ($scope, $rootScope, $http, UserService, CityService, $routeParams, $location, $cookieStore) {

    // Navigation Logic
    $scope.currentUser = $cookieStore.get('loggedin');

    $scope.logout = function () {
        console.log("calling logout");
        $http.post("/logout")
            .success(function () {
                $rootScope.currentUser = null;
                $cookieStore.put('loggedin', null);
                $location.url('/home');
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
            $scope.currentUser = $cookieStore.get('loggedin');
        });
    };


    var city = $routeParams.city
    var lat = $routeParams.lat;
    var lon = $routeParams.lon;

    $scope.cityName = city;
    var star = 1;

    $scope.rating1 = 1;
    $scope.rateFunction = function (rating) {
        console.log("Rating selected: " + rating);
        star = rating;
    };

    // cityImage
    $http.jsonp("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + city + "&callback=JSON_CALLBACK")
        .success(function (response) {
            $scope.cityImage = response.responseData.results[0].unescapedUrl;
        })
        .error(function () {
            console.log("got error");
        })

    $scope.cancel = function () {
        var url = '/destination/' + city + "/" + lat + "/" + lon;
        $location.url(url);
    }

    // publish a review
    $scope.publishReview = function (review) {
        var str = '/destination/' + city + "/" + lat + "/" + lon;
        var cityId = $cookieStore.get('cityID');
        var username = $cookieStore.get('loggedin');

        var title = review.title;
        var story = review.story;

        var dataProfile = {
            cityName: city,
            username: username,
            title: title,
            story: story
        };

        var data = {
            cityId: cityId,
            username: username,
            rating: star,
            title: title,
            story: story
        };

        console.log(dataProfile);
        $http.post('api/profile/review', dataProfile)
            .success(function (response) {
                console.log("review inserted into profile");
                console.log(data);
                $http.post('api/city/review', data)
                    .success(function (response) {
                    console.log("review posted");
                    $location.url(str);
                })
                    .error(function () {
                    console.log('error');
                });
            })
            .error(function () {
                console.log("error in profile review");
            });        
    };
}).directive("starRating", function () {
    return {
        restrict: "EA",
        template: "<ul class='rating'>" +
                   "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
                   "    <i class='fa fa-star'></i>" + //&#9733
                   "  </li>" +
                   "</ul>",
        scope: {
            ratingValue: "=ngModel",
            max: "=?", //optional: default is 5
            onRatingSelected: "&?",
            readonly: '@'
        },
        link: function (scope, elem, attrs) {
            if (scope.max == undefined) { scope.max = 5; }
            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function (index) {
                if (scope.readonly === 'true') {
                    return;
                }
                scope.ratingValue = index + 1;
                scope.onRatingSelected({
                    rating: index + 1
                });
            };
            scope.$watch("ratingValue", function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
    };
});
