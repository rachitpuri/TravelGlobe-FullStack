app.controller("passwordController", function ($scope, $rootScope, $timeout, $http, $location, $modalInstance, $cookieStore, UserService) {

    var loggedinUser = $cookieStore.get('loggedin');

    $scope.submit = function () {

        var password = {
            username: loggedinUser,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirmpass: $scope.newpass2
        };
        console.log(password);
        if ($scope.newpass != $scope.newpass2) {
            alert("New password and confirm password needs to be same");
        } else {
            $http.post('api/changePassword', password)
                .success(function (response) {
                    if (response.oldpass = "") {
                        alert("oldpass not correct");
                    } else {
                        $cookieStore.put('loggedin', null);
                        $modalInstance.dismiss('cancel');
                        $location.url('/home');
                    }
                })
                .error(function (err) {
                    console.log(err);
                })
            }   
        };
});