app.controller("DashBoardController", function ($scope, $http, $cookieStore, $location, $rootScope) {

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

    var currentUser = $cookieStore.get('loggedin');
    console.log(currentUser);

    $scope.totalItems = 64;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
        $log.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.getPage = function () {
        getReviews($scope.bigCurrentPage);
    };

    $scope.maxSize = 5;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    getReviews($scope.bigCurrentPage);
    
    // user reviews
    function getReviews(page) {
        console.log("getting reviews: " +page);
        $http.get("api/dashboard/review/" + page + "/" + currentUser)
            .success(function (response) {
                console.log(response);
                //followers = response[0].followers;
                //console.log(followers);
                if (response[0].image != "")
                    $scope.userImage = "data:image/jpeg;base64," + btoa(response[0].image);
                else
                    $('.user-image').attr('src', 'img/user.png');
                $scope.user = response[0];
                $scope.reviews = response[0].comment;
                $scope.reviewCount = response[0].reviewCount;
            })
            .error(function () {
                console.log("some error");
            });
    }

    // User followers
    $http.get("api/getImages/followers/" + currentUser)
        .success(function (response) {
            console.log(response);
            var Userimages = [];
            for (var i in response) {
                console.log(response);
                if(response[i].image != "")
                    Userimages.push({ "image": "data:image/jpeg;base64," + btoa(response[i].image), "username": response[i].username });
                else
                    Userimages.push({ "image": '../img/user.png', "username": response[i].username });
            }
            $scope.followers = Userimages;
            console.log(Userimages);
        })
        .error(function (err) {
            console.log(err);
        })

    // User following
    $http.get("api/getImages/following/" + currentUser)
        .success(function (response) {
            console.log(response);
            var Userimages = [];
            for (var i in response) {
                console.log(response);
                if (response[i].image != "")
                    Userimages.push({ "image": "data:image/jpeg;base64," + btoa(response[i].image), "username": response[i].username });
                else
                    Userimages.push({ "image": '../img/user.png', "username": response[i].username });
            }
            $scope.followings = Userimages;
            console.log(Userimages);
        })
        .error(function (err) {
            console.log(err);
        })
    
    $scope.followerProfile = function (username) {
        console.log(username);
        $location.url('/profile/' + username);
    };

    $scope.readMore = function (review, index) {
        if (review.numLimit && review.numLimit > 60) {
            review.numLimit = 50;
            $('.readmore').eq(index).html("read more <i class='fa fa-caret-down'>");
        }
        else {
            $('.readmore').eq(index).html("read less <i class='fa fa-caret-up'>");
            review.numLimit = 5000;
        }       
    };

});
