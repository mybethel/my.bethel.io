angular.module('Bethel.util').service('$socket', ['$q', function ($q) {

  this.get = function(where) {
    return $q(function (resolve, reject) {
      io.socket.get(where, resolve);
    });
  };

}]);
