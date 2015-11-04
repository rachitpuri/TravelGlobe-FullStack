app.controller("PointOfInterestController", function ($scope, $routeParams, $http, $cookieStore, $location, $modal, $rootScope, $cookieStore) {

    // Navigation Logic
    $scope.currentUser = $cookieStore.get('loggedin');

    $scope.logout = function () {
        console.log("calling logout");
        console.log($rootScope.currentUser);
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

    var s1 = $routeParams.lat;
    var s2 = $routeParams.lon;
    var city = $routeParams.city;
    var city_shortname = city.split(',')[0];
    console.log(s1, s2);
    var lat = parseFloat(s1.substring(4, 15)).toFixed(2);
    var lon = parseFloat(s2.substring(4, 15)).toFixed(2);

    console.log(lat, lon);
    $scope.selectedItem = "food";
    $scope.cityName = city_shortname;
    $scope.priceValid = true;

    // cityImage
    $http.jsonp("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + city + "&callback=JSON_CALLBACK")
        .success(function (response) {
            $scope.cityImage = response.responseData.results[0].unescapedUrl;
            $scope.selectedItem = query;
        })
        .error(function () {
            console.log("got error");
        })

    var query = $routeParams.query;
    console.log(query);

    // deafult food recommedations for a city
    $http.get("https://api.foursquare.com/v2/venues/explore?client_id=CNJEZO3QR35ZFEJAPZUIKS4AFLCCPO3WOAAY4H0TCAVSB545&client_secret=NLHBQ250KZTZIMYYGUZUILNSDWZ4HVXOOTRWWHDEC55Q4YAP&v=20130815&ll=" + lat + "," + lon + "&section=" + query + "&limit=30&venuePhotos=1")
        .success(function (response) {
            console.log(response); 
            $scope.items = response.response.groups[0].items;
        })
        .error(function (error) {
            console.log("some error");
        })

    //query based results
    $scope.getPlaceInfo = function (search) {
        query = search;
        $scope.selectedItem = query;

        if (search == "food" || search == "drinks") {
            $scope.priceValid = true;
        } else {
            $scope.priceValid = false;
        }

        $http.get("https://api.foursquare.com/v2/venues/explore?client_id=CNJEZO3QR35ZFEJAPZUIKS4AFLCCPO3WOAAY4H0TCAVSB545&client_secret=NLHBQ250KZTZIMYYGUZUILNSDWZ4HVXOOTRWWHDEC55Q4YAP&v=20130815&ll=" + lat + "," + lon + "&section=" + query + "&limit=30&venuePhotos=1")
       .success(function (response) {
           console.log(response);
           $scope.items = response.response.groups[0].items;
       })
       .error(function (error) {
           console.log("some error");
       })
    }

});