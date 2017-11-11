var schedWeb = angular.module('schedWeb', []);

schedWeb.controller('mainController', function ($scope, $http){

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
            console.log($scope.addedCourses);
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
    }

    $scope.hideAddedMsg = function(status){
        $scope.newAdded = status;
    };

    $scope.getSchedules = function(){
        console.log("DerpSchedules!");
        var courses = []
        for (var course of $scope.addedCourses){
            courses.push(course.id);
        }

        fetchSchedules(courses, 
            {
                "mornings":$scope.mornings,
                "evenings":$scope.evenings,
                "mondays":$scope.mondays,
                "fridays":$scope.fridays,
                "balanced":$scope.balanced,
                "gaps":$scope.gaps,
                "openings":$scope.openings
            }, 
            function(data){

            });

    }
});