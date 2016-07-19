angular.module('Bethel.user')
  .controller('billingController', BillingController)
  .directive('invoiceLineItem', InvoiceLineItem);

function BillingController($scope, sailsSocket) {

  $scope.billDate = new Date();
  $scope.currentBill = sailsSocket.populateOne('invoice/ministry');

}

BillingController.$inject = ['$scope', 'sailsSocket'];

function InvoiceLineItem() {

  var invoiceDisplay = {
    podcast: {
      friendly: 'Podcast streaming'
    }
  };

  return {
    restrict: 'AE',
    scope: {
      amount: '=',
      date: '=',
      type: '=',
      units: '='
    },
    link: function(scope, element, attrs) {
      var display = invoiceDisplay[scope.type];
      scope.friendly = display.friendly;
    },
    template:
      '<md-list-item>' +
        '<p><span ng-if="date">{{ date | date:\'MM/dd\' }}</span>{{ friendly }}</p>' +
        '<p class="md-secondary"><span ng-if="units">{{ units | bytes }}</span> &nbsp; {{ amount | currency:\'$\':(units ? 3 : 2) }}</p>' +
      '</md-list-item>'
  };

}
