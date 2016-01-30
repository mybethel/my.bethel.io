angular.module('Bethel.staff').controller('staffInvoiceController', StaffInvoiceController);

function StaffInvoiceController($scope, sailsSocket) {

  $scope.billDate = new Date();
  $scope.currentBill = sailsSocket.populateOne('invoice/ministry/all');

}

StaffInvoiceController.$inject = ['$scope', 'sailsSocket'];
