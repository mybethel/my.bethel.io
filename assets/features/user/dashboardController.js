angular.module('Bethel.user')
.controller('dashboardController', DashboardController);

function DashboardController($scope) {
  $scope.user = $scope.$root.user;
}

DashboardController.$inject = ['$scope'];
