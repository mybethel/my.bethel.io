/**
 * Could be modified to handle existing documents by passing ID as well as attribute
 * See: http://weblogs.asp.net/dwahlin/building-a-custom-angularjs-unique-value-directive
 **/

angular.module('Bethel.util')
  .directive('unique', ['sailsSocket', function (sailsSocket) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      scope.$watch(attrs.ngModel, function (value) {
        if (!ngModel || !value) return;

        var uniqueAttrs = JSON.parse(attrs.unique),
            endpoint = '/' + uniqueAttrs.model + '?' + ngModel.$name + '=' + escape(value);

        sailsSocket.get(endpoint)
          .then(function (results) {
            // Make sure input value hasn't changed since request was made.
            if (value === element.val()) {
              if (uniqueAttrs.id && uniqueAttrs.id === results[0].id) {
                ngModel.$setValidity('unique', true);
              } else {
                ngModel.$setValidity('unique', !results.length);
              }
            }
          });
      });
    }
  };
}]);
