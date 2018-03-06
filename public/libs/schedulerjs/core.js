var schedWeb = angular.module('schedWeb', ['ui.bootstrap']);

schedWeb.controller('mainController', function ($scope, $http, $uibModal, $timeout, $rootScope){

    $scope.coursesLoading = true;
    $scope.newAdded       = true;
    
    function setCourseLoadingStatus(status){
        $scope.coursesLoading = status;
    }

    $scope.populateCourses = function(){
        setCourseLoadingStatus(true);
        $scope.hideAddedMsg(true);

        term = encodeURIComponent($scope.yearTerm.id);
        dept = encodeURIComponent($scope.dept.id);

        $scope.currentCourseList = [{id:0, name:"Loading..."}];
        $scope.selectedCourse    = $scope.currentCourseList[0];

        $http.get('/api/retrieval/Courses/'+term+'/'+dept)
            .then(function success (data) {
                // console.log(data);
                $scope.currentCourseList = data.data.data;
                $scope.selectedCourse    = $scope.currentCourseList[0];
                setCourseLoadingStatus(false);
            }, function error (data) {
                console.log('Error: ' + data);
            });
    };

    $http.get('/api/retrieval/YearTermDept')
        .then(function success (data) {
            $scope.yearTerms = data.data.yearTerm;
            // TODO: define a more intelligent selection of the yearTerm here
            $scope.yearTerm  = $scope.yearTerms[0];
            $scope.depts = data.data.dept;
            $scope.dept  = $scope.depts[0];
            // console.log(data.data.yearTerm);
            $scope.populateCourses();
        }, function error (data) {
            console.log('Error: ' + data);
        });
    
    $http.get('/webapi/population')
        .then(function success (data) {
            $scope.addedCourses = data.data;
            
        }, function error (data) {
            console.log('Error: ' + data);
        });


    $scope.addCourse = function(){
        $http.post('/webapi/population/'+$scope.selectedCourse.id)
        .then(function success(data){
            $scope.addedCourses = data.data;
            $scope.hideAddedMsg(false);
        }, function error (data){
            console.log('Error: ' + data);
        })
    };

    $scope.delCourse = function(index){
        $scope.hideAddedMsg(true);
        $http.delete('/webapi/population/'+index)
        .then(function success(data){
            $scope.addedCourses = data.data;
        }, function error (data){
            console.log('Error: ' + data);
        })
    };

    $scope.hideAddedMsg = function(status){
        $scope.newAdded = status;
    };

    $scope.getSchedules = function(){
        var courses = [];
        for (var course of $scope.addedCourses){
            courses.push(course.id);
        }

        fetchSchedules(courses, 
            {
                "mornings": $scope.mornings,
                "evenings": $scope.evenings,
                "mondays" : $scope.mondays,
                "fridays" : $scope.fridays,
                "balanced": $scope.balanced,
                "gaps"    : $scope.gaps,
                "openings": $scope.openings
            }, 
            function(data){

            });

        $timeout(function() {
            $rootScope.$broadcast('openCornerNotification', {
                text: "Looks like you're interested! So, what do you think?",
                autoClose: true,
                acceptFn: function() {
                    $scope.openFeedbackModal();
                }
            });
        }, 10000);
    };

    $scope.openFeedbackModal = function() {
        $uibModal.open({
            animation: true,
            templateUrl: 'public/directives/feedback.html',
            controller: 'feedbackModalController',
            controllerAs: '$ctrl',
            resolve: {}
        }).result.then(function(responses) {
            console.log(responses);
        }, function() {});
    };
})
.controller('cornerNotificationController', function($scope, $timeout) {
    var $ctrl = this;
    var currentId = 0;

    $scope.notifications = [];

    $scope.$on('openCornerNotification', function(event, data) {
        if (data.autoClose === undefined) data.autoClose = true;
        if (data.acceptFn  === undefined) data.acceptFn  = function(){};

        var id = currentId++;

        var notification = {
            id: id,
            text: data.text,
            accept: function() {
                // Timeout allows for cancel to take effect first, if necessary
                $timeout(function() {
                    var i = $scope.notifications.findIndex(function(x){return x.id === id;});
                    if (i >= 0) {
                        $scope.notifications.splice(i, 1);
                        data.acceptFn();
                    }
                }, 10);
            },
            cancel: function() {
                var i = $scope.notifications.findIndex(function(x){return x.id === id;});
                if (i >= 0) $scope.notifications.splice(i, 1);
            }
        };

        $scope.notifications.push(notification);

        if (data.autoClose) {
            $timeout(notification.cancel, 10000);
        }
    });
})
.controller('feedbackModalController', function($uibModalInstance, $scope) {
    var $ctrl = this;

    $scope.ratingMax = 5;

    $scope.ease            = 0;
    $scope.timeSaved       = 0;
    $scope.preferenceMatch = 0;
    $scope.useAgain        = 0;

    $ctrl.ok = function() {
        $uibModalInstance.close({
            ease:            $scope.ease,
            timeSaved:       $scope.timeSaved,
            preferenceMatch: $scope.preferenceMatch,
            useAgain:        $scope.useAgain
        });
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
})
// .directive('cnotification', function() {
//     return {
//         restrict: 'E',
//         replace: true,
//         scope: {
//             text: '=',
//             accept: '&',
//             cancel: '&'
//         },
//         templateUrl: 'public/directives/cornerNotification.html'
//     };
// })
.directive('preferenceSlider', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            name: '@',
            id: '=',
            tooltip: '@'
        },
        templateUrl: 'public/directives/preferenceSlider.html'
    };
})
;