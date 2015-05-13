angular.module('Bethel.staff')

.controller('MinistryListController', function ($rootScope, $scope, $stateParams, $state, $location) {

  $scope.creatingMinistry = false;
  $scope.newMinistry = {};

  $scope.$parent.selectedStaffSection = 'ministries';

  $rootScope.$watch('isAdmin', function() {
    if (typeof $rootScope.isAdmin !== 'undefined' && $rootScope.isAdmin === false) {
      $location.path('/').replace();
    }
  });

  $scope.init = function() {
    io.socket.get('/ministry', function (response, status) {
      $scope.$apply(function() {
        $scope.ministries = response;
        $scope.orderByField = 'createdAt';
      });
    });
  };

  $scope.detailedMinistryTransition = function(ministryId) {
    $state.transitionTo('staff.detailedMinistry', {'ministryId': ministryId});
  };

  $scope.toggleCreatingMinistry = function() {
    $scope.newMinistry = {};
    $scope.creatingMinistry = !$scope.creatingMinistry;
  };

  $scope.createMinistry = function() {

    var ministry = $scope.newMinistry;

    io.socket.post('/ministry', {
      name: ministry.name,
      _csrf: $rootScope._csrf
    }, function (data) {
      $scope.$apply(function() {
        $scope.ministries.push(data);
        $scope.toggleCreatingMinistry();
      });
    });

  };

  $scope.init();

});
