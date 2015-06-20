angular.module('Bethel.util').service('$socket', ['$q', function ($q) {

  this.get = function(where) {
    return $q(function (resolve, reject) {
      io.socket.get(where, resolve);
    });
  };

  this.post = function(where, what) {
    return $q(function (resolve, reject) {
      io.socket.post(where, what, resolve);
    });
  };

  this.put = function(where, what) {
    return $q(function (resolve, reject) {
      io.socket.put(where, what, resolve);
    });
  };

}]);
