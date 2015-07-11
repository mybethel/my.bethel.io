angular.module('Bethel.staff')

.controller('staffMinistryListController',['$scope', '$state', 'sailsSocket', '$mdDialog',
  function ($scope, $state, sailsSocket, $mdDialog) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 1;
  $scope.orderByField = 'createdAt';

  $scope.ministries = sailsSocket.populateMany('/ministry');

  $scope.detailedMinistryTransition = function(ministryId) {
    $state.transitionTo('staff.detailedMinistry', {'ministryId': ministryId});
  };

  $scope.showCreateMinistry = function(event) {

    $mdDialog.show({
      clickOutsideToClose: true,
      focusOnOpen: false,
      templateUrl: 'features/staff/staffMinistryCreateView.html',
      targetEvent: event,
      controller: 'staffMinistryCreateController'
    })
    .then(function (data) {
      $scope.ministries.push(data);
    });

  };

}]);
