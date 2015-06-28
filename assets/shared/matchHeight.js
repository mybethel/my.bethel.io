angular.module('Bethel.util')
.directive('matchHeight', ['$timeout', function ($timeout) {
  return {
    link: function(scope, element, attrs) {

      scope.equalized = [];
      scope.equalize = attrs.equalize;

      scope.$watch(function() {
        return element[0].childNodes.length;
      }, function (newValue, oldValue) {
        if (!newValue || newValue === oldValue) return;
        $timeout(function() {
          scope.equalized = element.find(scope.equalize);
        });
      });

      scope.getMaxHeight = function() {
        scope.maxHeight = 0;
        angular.forEach(scope.equalized, function (el) {
          angular.element(el).attr('style', '');
          var elHeight = angular.element(el).prop('offsetHeight');
          if (elHeight > scope.maxHeight) scope.maxHeight = elHeight;
        });
        scope.applyHeight();
      };

      scope.$watch('equalized', scope.getMaxHeight);
      window.addEventListener('resize', scope.getMaxHeight);

      scope.applyHeight = function() {
        if (!scope.maxHeight) return;
        angular.forEach(scope.equalized, function (el) {
          angular.element(el).attr('style', 'box-sizing:border-box;height:' + scope.maxHeight + 'px');
        });
      };

    }
  };
}]);
