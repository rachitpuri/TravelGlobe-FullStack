app.controller("ProfileController", function ($http, $scope, $rootScope, ngToast, $interval, $route, $timeout, $rootScope, $log, $modal, $cookieStore, $routeParams, $location, UserService, CityService) {

    // Navigation Logic
    $scope.currentUser = $cookieStore.get('loggedin');
    console.log($scope.currentUser);
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


    var follow = false;
    var username = $routeParams.username;
    console.log(username);
    var loggedinUser = $cookieStore.get('loggedin');

    if (loggedinUser != null)
        loggedinUser = loggedinUser;

    var sameUser = false;
    if (username == loggedinUser) {
        sameUser = true;
    }
    $scope.editable = sameUser;
    var photo = null;

    var options1 = {
        content: "Mesage sent to : " + "" + username,
        alertClass: alert,
        classes: 'foo',
        dismissOnTimeout: true,
        timeout: 3000,
        dismissButton: false,
        dismissButtonHtml: '&times',
        dismissOnClick: true,
        compileContent: false,
    };

    var handleFileSelect = function (evt) {
        var files = evt.target.files;
        var file = files[0];

        if (files && file) {
            var reader = new FileReader();

            reader.onload = function (readerEvt) {
                var binaryString = readerEvt.target.result;
                $scope.loc = "data:image/jpeg;base64," + btoa(binaryString);
                $scope.$apply();
            };
            reader.readAsBinaryString(file);
        }
    };

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $('#filePicker').change(handleFileSelect);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    // fetch User details
    console.log(username);
    $http.get("api/profile/userdetail/" + username)
        .success(function (response) {
            console.log(response[0]);
            $rootScope.user = response[0];
            var followers = response[0].followers;
            console.log(followers);
            for (var i in followers) {
                if (followers[i] == loggedinUser) {
                    console.log("YES");
                    follow = true;
                    $scope.toggleText = "UnFollow";
                    $('#follower').removeClass("btn-success").addClass("btn-warning");
                }
            }
            if (!follow)
                $scope.toggleText = "Follow";

            var userImage;
            if (sameUser)
                userImage = loggedinUser;
            else
                userImage = username
            $http.get("api/getuserImage/" + userImage)
                .success(function (response) {
                    console.log(response);
                    if (response.image != "")
                        $scope.loc = "data:image/jpeg;base64," + btoa(response.image);
                    else
                        $scope.loc = "../img/user.png";
                })
            .error(function (response) {
                console.log("error in phot display");
            })
        })
        .error(function () {
            console.log("error in displaying user data");
        })

    // change password
    $scope.changePassword = function () {

        var modalInstance = $modal.open({
            templateUrl: 'views/changePassword/password.html',
            controller: 'passwordController'
        });
    };

    // save profile changes
    $scope.saveChanges = function () {
        var username = $cookieStore.get('loggedin');
        var countries = $('#country').val();
        var description = $('#description').val();
        var data = {
            username: username,
            country: countries,
            description: description
        };
        var profileSaved = {
            content: "Profile Saved",
            alertClass: alert,
            classes: 'foo',
            dismissOnTimeout: true,
            timeout: 3000,
            dismissButton: false,
            dismissButtonHtml: '&times',
            dismissOnClick: true,
            compileContent: false,
        };
        console.log(data);
        $http.post('api/editProfile', data)
            .success(function (response) {
                if (response.username = "") {
                    alert("username not in DB");
                } else {
                    ngToast.create(profileSaved);
                }
            })
    };

    // follow user logic
    $scope.follow = function (username) {
        loggedinUser = $cookieStore.get('loggedin');
        if (loggedinUser == null) {
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
                console.log(result);
                $route.reload();
            });
        } else {
            var bool;
            if ($scope.toggleText == "Follow")
                bool = true;
            else
                bool = false;
            console.log(bool);
            var data = {
                follow: bool,
                follower: loggedinUser,
                following: username
            };
            console.log(data);

            var alert, content;
            if (bool) {
                alert = 'success';
                content = 'You are following : ';
            }
            else {
                alert = 'warning';
                content = 'You unfollowed : '
            }

            var options = {
                content: content + "" + data.following,
                alertClass: alert,
                classes: 'foo',
                dismissOnTimeout: true,
                timeout: 3000,
                dismissButton: false,
                dismissButtonHtml: '&times',
                dismissOnClick: true,
                compileContent: false,
            };

            // creating toast
            ngToast.create(options);

            $http.post("api/follow", data)
                .success(function (response) {
                    console.log("successully followed");
                })
                .error(function () {
                    console.log("error in following client");
                })

            if ($scope.toggleText == "Follow") {
                $scope.toggleText = "UnFollow";
                $('#follower').removeClass("btn-success").addClass("btn-warning");
            }
            else {
                $scope.toggleText = "Follow";
                $('#follower').removeClass("btn-warning").addClass("btn-success");
            }
        }
    }

    //send message
    $scope.openMessage = function () {
        loggedinUser = $cookieStore.get('loggedin');
        if (loggedinUser == null) {
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
            $rootScope.$broadcast('divButton:clicked', 'hello world via event');
            var modalInstance = $modal.open({
                templateUrl: 'views/sendMessage/sendMessage.html',
                controller: 'sendMessageController',
            });

            modalInstance.result.then(function () {
                ngToast.create(options1);
            });
        };
    };
});
