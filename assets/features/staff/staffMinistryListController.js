angular.module('Bethel.staff')

.controller('staffMinistryListController',['$scope', '$stateParams', '$state', '$location', '$mdDialog',
  function ($scope, $stateParams, $state, $location, $mdDialog) {

  $scope.$parent.tabIndex = 1;

  $scope.$root.$watch('isAdmin', function() {
    if (typeof $scope.$root.isAdmin !== 'undefined' && $scope.$root.isAdmin === false) {
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

  $scope.showCreateMinistry = function(event) {

    $mdDialog.show({
      clickOutsideToClose: true,
      focusOnOpen: false,
      parent: document.body
      templateUrl: 'features/staff/staffMinistryCreateView.html',
      targetEvent: event,
      controller:  function createMinistryDialog($scope, $timeout) {

        $scope.createNewMinistry = function() {

          io.socket.post('/ministry', {
            name: $scope.newMinistry.name,
            _csrf: $scope.$root._csrf
          }, function (data) {
            $mdDialog.hide(data);
          });

        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $timeout(function () {
          document.querySelector('input.focus').focus();
        });

      }
    })
    .then(function (data) {
      $scope.ministries.push(data)
    });;

  };

  $scope.init();

}]);
