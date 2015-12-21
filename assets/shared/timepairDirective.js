angular.module('Bethel.util').directive('timepair', [function() {

  var now = new Date().getHours();

  var generateTimes = function(startTime) {
    var start = startTime || now,
        times = [],
        halfhour = (start % 1 !== 0);

    if (halfhour) {
      start -= .5;
    }

    for (var i = 0; i < 24; i++) {
      var rawhour = Number(start) + i;
      if (rawhour > 24) rawhour = rawhour - 24;
      var meridiem = (rawhour > 11 && rawhour < 24) ? 'PM' : 'AM';
      var hour = (rawhour > 12) ? rawhour - 12 : rawhour;

      if (!halfhour || (halfhour && i > 0)) {
        times.push({ raw: rawhour, display: hour + ':00' + meridiem });
      }
      times.push({ raw: rawhour + .5, display: hour + ':30' + meridiem });
    }
    return times;
  };

  return {
    restrict: 'EA',
    scope: {
      start: '=',
      end: '=',
      duration: '='
    },
    replace: true,
    link: function(scope, element) {
      scope.startTimes = generateTimes();

      scope.timepairDuration = function(index) {
        var minutes = index * 30;
        if (minutes < 60) {
          return minutes ? '30 mins' : '0 mins';
        }
        var hours = minutes / 60;
        return hours > 1 ? hours + ' hrs' : '1 hr';
      };

      scope.$watch('start', function(newValue) {
        scope.end = undefined;
        scope.endTimes = generateTimes(newValue);
      });

      scope.$watch('end', function(newValue) {
        scope.duration = 0;
      });
    },
    template:
      '<div><md-input-container>' +
        '<label>Start</label>' +
        '<md-select ng-model="start">' +
          '<md-option ng-repeat="time in startTimes" value="{{ time.raw }}">{{ time.display }}</md-option>' +
        '</md-select>' +
      '</md-input-container>' +
      '<md-input-container>' +
        '<label>End</label>' +
        '<md-select ng-disabled="!start" ng-model="end">' +
          '<md-option ng-repeat="time in endTimes" value="{{ time.raw }}">{{ time.display }}<small> ({{ timepairDuration($index) }})</small></md-option>' +
        '</md-select>' +
      '</md-input-container></div>'
  };
}]);
