app.controller("CityController", function ($scope, $http, $timeout, $transition, $rootScope, $modal, $route, $routeParams, CityService, $cookieStore, $location) {

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


    var city = $routeParams.city;
    var s1 = $routeParams.lat;
    var s2 = $routeParams.lon;
    var lat = s1.substring(4, 30);
    var lon = s2.substring(4, 30);

    console.log(s1, s2);
    var cityId = $cookieStore.get('cityID');
    if (typeof city == "string") {
        console.log("YES");
    } else
        console.log("NO");
    var shortname = city.split(',')[0];
    var removeSpaces = city.replace(/\s/g, '');
    $scope.cityShortname = shortname;
    $scope.searchCity = removeSpaces;
    $scope.latitude = lat;
    $scope.longitude = lon;

    // Getting City Temperature
    $http.jsonp("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&callback=JSON_CALLBACK")
        .success(function (response) {
            var number = response.main.temp - 273.15;
            var temp = number.toFixed(1);
            $scope.temperature = temp;
        })
        .error(function () {
            console.log('error');
        });

    // getting city Images
    var myimages = [];
    $http.jsonp("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + removeSpaces + "&callback=JSON_CALLBACK")
        .success(function (response) {
            for (var i = 0; i < 4; i++) {
                myimages.push(response.responseData.results[i].unescapedUrl);
            }
            $scope.myInterval = 5000;
            var slides = $scope.slides = [];
            $scope.addSlide = function (i) {
                slides.push({
                    image: myimages[i]
                });
            };
            for (var i = 0; i < 4; i++) {
                $scope.addSlide(i);
            }
        })
        .error(function () {
            console.log("got error");
        })


    // Implementing readMore / readLess option
    $scope.readMore = function (review, index) {
        if (review.numLimit && review.numLimit > 200) {
            review.numLimit = 180;
            $('.readmore').eq(index).html("read more <i class='fa fa-caret-down'>");
        }
        else {
            $('.readmore').eq(index).html("read less <i class='fa fa-caret-up'>");
            review.numLimit = 5000;
        }
    };

    // get all users
    var users = [];
    $http.get("api/getallusers")
        .success(function (response) {
            console.log("getting all users");
            console.log(response);
            users = response;

            var rating = 0;
            $http.get("api/getreview/city/" + cityId + "/" + 0)
                .success(function (response) {
                    var totalreviews = 0;
                    console.log(response);
                    for (var res in response) {
                        for (var user in users) {
                            if (response[res].username == users[user].username) {
                                response[res].reviewCount = users[user].reviewCount;
                                response[res].followers = users[user].followers.length;
                                if (users[user].image != "")
                                    response[res].image = "data:image/jpeg;base64," + btoa(users[user].image);
                                else
                                    response[res].image = '../img/user.png';
                            }
                        }
                        rating = rating + response[res].rating;
                    }
                    console.log(response);
                    console.log(rating / response.length);
                    $scope.cityRating = (rating / response.length).toFixed(1);
                    $scope.reviews = response;
                    $scope.totalReviewCount = response.length;
                })
                .error(function (err) {
                    console.log("error in profile pics");
                });
        });

    // Getting city point of interest
    $scope.getPointOfInterest = function (query) {
        var url = '/destination/' + city + "/lat=" + lat + "/lon=" + lon +"/poi" +"/" +query;
        $location.url(url);
    }

    // Write a review
    $scope.writeReview = function () {
        var currentUser = $cookieStore.get('loggedin');
        if (currentUser == null) {
            var modalInstance = $modal.open({
                templateUrl: 'views/login/login.html',
                controller: 'loginController',
                resolve: {
                    type: function () {
                        return 'signIn';
                    }
                }
            });
            modalInstance.result.then(function (result) {
                $route.reload();
            });
        } else {
            var city = $scope.searchCity;
            var lat = $scope.latitude;
            var lon = $scope.longitude;
            var str = '/destination/'+city+'/lat='+lat+'/lon='+lon+'/UserReview';
            $location.url(str);
        }
    }
});
