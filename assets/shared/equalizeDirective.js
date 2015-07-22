angular.module('Bethel.util')
.directive('equalize', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      var maxHeight = 0;

      function findElements() {
        if (!attrs.equalize)
          return element[0].children;

        return element[0].querySelectorAll(attrs.equalize);
      };

      function applyMaxHeight() {
        if (!maxHeight || !scope.equalized) return;
        angular.forEach(scope.equalized, function (el) {
          angular.element(el).css('height', maxHeight + 'px');
        });
      };

      function getMaxHeight() {
        if (!scope.equalized) return;
        maxHeight = 0;
        angular.forEach(scope.equalized, function (el) {
          angular.element(el).css('height', '');
          maxHeight = Math.max(maxHeight, el.offsetHeight);
        });
        applyMaxHeight();
      };

      scope.equalized = findElements();
      scope.$watch(function() {
        return element[0].childNodes.length;
      }, function (newValue, oldValue) {
        if (!newValue || newValue === oldValue) return;
        scope.equalized = findElements();
      });

      window.addEventListener('resize', getMaxHeight);
      scope.$watch('equalized', function(newValue, oldValue) {
        if (!newValue) return;
        angular.forEach(scope.equalized, function (el) {
          scope.$watch(function() {
            return el.offsetHeight;
          }, getMaxHeight);
        });
      });

    }
  };
});
