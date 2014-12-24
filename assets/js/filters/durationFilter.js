angular.module('Bethel.media').filter('duration', function() {
  return function(milliseconds) {
    milliseconds = Number(milliseconds);
    var seconds = Math.floor(milliseconds / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return minutes + ':' + seconds;
  };
});
