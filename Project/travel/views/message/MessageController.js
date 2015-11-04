app.controller("MessageController", function ($scope, $http, $routeParams, $location, $cookieStore, $rootScope) {

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

    var user = $routeParams.username;
    var message = [];
    var bool = false;
    console.log(user);

    // User Messages
    $http.get("api/user/getmessage/" + user)
        .success(function (response) {
            console.log(response);
            for (i = response.length - 1; i >= 0; i--) {
                bool = false;
                if (response[i].sender != user) {
                    for (j = 0; j < message.length; j++) {
                        if (message[j].user == response[i].sender) {
                            bool = true;
                            break;
                        }
                    }
                    if (!bool) {
                        var newmsg = {
                            user: response[i].sender,
                            msg: response[i].message,
                            date: response[i].date
                        };
                        message.push(newmsg);
                    }
                } else {
                    for (j = 0; j < message.length; j++) {
                        if (message[j].user == response[i].receiver) {
                            bool = true;
                            break;
                        }
                    }
                    if (!bool) {
                        var newmsg = {
                            user: response[i].receiver,
                            msg: response[i].message,
                            date: response[i].date
                        };
                        message.push(newmsg);
                    }
                }
            }
        
            // getting images
            var imageArray = { "users": [] };

            for (var i in message) {
                imageArray.users.push({ "user": message[i].user });
            }

            $http.post("api/message/user/images",  imageArray)
                .success(function (response) {
                    console.log(response);
                    for (var i in message) {
                        for (var j in response) {
                            if (message[i].user == response[j].username) {
                                message[i].image = "data:image/jpeg;base64," + btoa(response[j].image);
                            }
                        }
                    }                    
                })
                .error(function (err) {
                    console.log(err);
                })
            console.log(message);
            $scope.mails = message;
        })
        .error(function () {
            console.log("some error while getting messages");
        })

    $scope.click = function (mail) {
        $location.url('/messagelist/' + mail.user);
    }
});
