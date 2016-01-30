angular.module('Bethel.user').controller('billingController', BillingController);

function BillingController($scope, sailsSocket) {

  $scope.billDate = new Date();
  $scope.currentBill = sailsSocket.populateOne('invoice/ministry');

}

BillingController.$inject = ['$scope', 'sailsSocket'];
