app.controller("MessageDetailController", function ($scope, $http, $routeParams, $cookieStore, $rootScope, $location, $route) {

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
    var mailUser = $routeParams.username;;

    // All messages
    $http.get("api/allmessages/" + currentUser + "/" + mailUser)
        .success(function (response) {
            console.log(response);

            $http.get("api/getImage/messageDetail/" + currentUser + "/" + mailUser)
                .success(function(resimage){
                    console.log(resimage);

                    for (var i in response) {
                        if (response[i].sender == resimage[0].username) {
                            if ((response[i].image != "") && (response[i].image != "data:image/jpeg;base64,"))
                                response[i].image = "data:image/jpeg;base64," + btoa(resimage[0].image);
                            else 
                                response[i].image = "..img/user.png";                            
                        }
                        else {
                            if (response[i].image != "" && response[i].image != "data:image/jpeg;base64,")
                                response[i].image = "data:image/jpeg;base64," + btoa(resimage[1].image);
                            else
                                response[i].image = "../img/user.png";
                        }
                    }
                })
                .error(function (err) {
                    console.log(err);
                })

            $scope.mails = response;
        })
        .error(function () {
            console.log("some error in MessageDetailController");
        })

    // Send Message
    $scope.sendMessage = function () {
        var sender = currentUser;
        var receiver = mailUser;
        var message = $scope.message;
        var data = {
            sender: sender,
            receiver: receiver,
            message: message
        }
        $http.post("api/messages/newMessage/", data)
            .success(function (response) {
                $http.get("api/allmessages/" + currentUser + "/" + mailUser)
                    .success(function (response) {
                        console.log(response);
                        $scope.mails = response;
                        $scope.message = "";
                        console.log("refresh");
                        $route.reload();
                    })
                    .error(function () {
                        console.log("some error in MessageDetailController");
                    })
            })
            .error(function () {
                console.log("some error");
            });
    };
});
