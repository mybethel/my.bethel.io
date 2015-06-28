angular.module('Bethel.staff')

.controller('staffMinistryListController',['$scope', '$stateParams', '$state', '$socket', '$mdDialog',
  function ($scope, $stateParams, $state, $socket, $mdDialog) {

  var $ctrl = this;
  $scope.$parent.tabIndex = 1;

  $ctrl.populateMinistries = function (response, status) {
    $scope.ministries = response;
    $scope.orderByField = 'createdAt';
  }

  $socket.get('/ministry').then($ctrl.populateMinistries);

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
