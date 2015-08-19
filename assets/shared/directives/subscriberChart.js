angular.module('Bethel.util').directive('subscribers', ['$timeout', function ($timeout) {
  return {
    scope: { history: '@' },
    link: function(scope, element, attrs) {
      scope.max = 0;
      scope.$watch('history', function (history) {
        if (angular.isUndefined(history) || typeof history !== 'string' || history === '')
          return;

        scope.history = JSON.parse(history);
        scope.history.forEach(function(stat) {
          if (stat > scope.max)
            scope.max = stat;
        });
      });
    },
    template: '<span data-ng-repeat="stat in history track by $index" data-count="{{ stat }}" style="height: {{ stat / max * 100 }}%"><span>'
  };
}]);
