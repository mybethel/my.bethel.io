angular.module('Bethel.util')
.directive('sticky', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var parent = element.parent(),
          offset = Number(attrs.offset) || 0;

      parent.css({ position: 'relative' });

      window.addEventListener('scroll', stickyElement);
      window.addEventListener('resize', stickyElement);

      element = element[0];

      scope.$watch(function() {
        return [parent[0].clientWidth, parent[0].clientHeight].join('x');
      }, function (newValue, oldValue) {
        if (!newValue || newValue === oldValue) return;
        stickyElement();
      });

      function stickyElement() {
        var distanceFromTop = parent[0].getBoundingClientRect().top;
        var distanceFromBottom = parent[0].getBoundingClientRect().bottom - (element.offsetHeight + offset);

        element.css({
          position: 'fixed',
          top: offset + 'px',
          width: parent.offsetWidth + 'px'
        });

        if (distanceFromTop > 0) {
          element.css('position', 'static');
        }
        if (distanceFromBottom < 0) {
          element.css('top', Math.round(distanceFromBottom) + 'px');
        }
      }
    }
  };
}]);
