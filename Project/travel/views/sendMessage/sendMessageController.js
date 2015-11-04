app.controller("sendMessageController", function ($scope, $rootScope, ngToast, $interval, $timeout, $http, $modalInstance, $routeParams, $cookieStore) {

    var username = $routeParams.username;
    console.log(username);
    $scope.receiver = username;
    var loggedinUser = $cookieStore.get('loggedin');

    if (loggedinUser != null)
        loggedinUser = loggedinUser;

    $scope.ok = function () {
        console.log("about to send message");
        var message = $scope.message;
        var sender = loggedinUser;
        var receiver = username;
        var data = {
            sender: sender,
            receiver: receiver,
            message: message
        }

        var options = {
            content: "Mesage send to : " + "" + data.receiver,
            alertClass: alert,
            classes: 'foo',
            dismissOnTimeout: true,
            timeout: 3000,
            dismissButton: false,
            dismissButtonHtml: '&times',
            dismissOnClick: true,
            compileContent: false,
        };

        $http.post("api/sendMessage", data)
            .success(function (response) {
                console.log("message send succesfully");
                ngToast.create(options);
            })
            .error(function () {
                console.log("Some error while sending the message");
            });

        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
