angular.module('Bethel.util').directive('timepair', [function() {

  var now = new Date().getHours();

  var floatToTime = function(float) {
    var hours = String(float).split('.').shift();
    var minutes = (float * 60) % 60;
    if (hours > 24) hours = hours - 24;
    var meridiem = (hours > 11 && hours < 24) ? 'PM' : 'AM';
    if (hours == 0) hours = 12;
    if (hours > 12) hours = hours - 12;
    return hours + ':' + ('0' + minutes).slice (-2) + meridiem;
  }

  var generateTimes = function(startTime, interval) {
    var interval = interval || 0.5,
        start = startTime || now,
        times = [];

    for (var i = 0; i < (1 / interval) * 24; i++) {
      var rawhour = Number(start) + (i * interval);
      times.push({ raw: rawhour, display: floatToTime(rawhour) });
    }
    return times;
  };

  return {
    restrict: 'EA',
    scope: {
      start: '=',
      end: '=',
    },
    link: function(scope, element, attrs) {
      scope.interval = Number(attrs.interval) || .5;
      scope.startTimes = generateTimes(null, scope.interval);

      scope.timepairDuration = function(index) {
        var minutes = index * (60 * scope.interval);
        if (minutes < 60) {
          return minutes + ' mins';
        }
        var hours = minutes / 60;
        return hours > 1 ? hours + ' hrs' : '1 hr';
      };

      scope.$watch('start', function(newValue) {
        scope.end = undefined;
        scope.endTimes = generateTimes(newValue, scope.interval);
      });
    },
    template:
      '<md-input-container>' +
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
      '</md-input-container>'
  };
}]);
