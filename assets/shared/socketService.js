angular.module('Bethel.util').service('sailsSocket', ['$q', '$rootScope', function ($q, $rootScope) {

  if (!io.socket) throw new Error('Missing required `sails.io.js` dependency.');

  $rootScope.sailsSocket = {
    _csrf: '',
    outstanding: 0
  };

  var populateQuery = function(from, params, many) {
    if (from[0] !== '/') from = '/'.concat(from);
    $rootScope.sailsSocket.outstanding++;
    var result = many ? [] : {};
    io.socket.get(from, params, function (data) {
      angular.forEach(data, function (item, index) {
        if (many) {
          result.push(item);
        } else {
          result[index] = item;
        }
      });
      $rootScope.sailsSocket.outstanding--;
      $rootScope.$digest();
    });
    return result;
  };

  this.get = function(where) {
    return $q(function (resolve, reject) {
      io.socket.get(where, function(data, response) {
        return (response.statusCode < 400) ? resolve(data) : reject(data);
      });
    });
  };

  this.populateOne = function(from, params) {
    return populateQuery(from, params);
  };

  this.populateMany = function(from, params) {
    return populateQuery(from, params, true);
  };

  this.post = function(where, what) {
    what._csrf = $rootScope.sailsSocket._csrf;
    return $q(function (resolve, reject) {
      io.socket.post(where, what, function(data, response) {
        return (response.statusCode < 400) ? resolve(data) : reject(data);
      });
    });
  };

  this.put = function(where, what) {
    what._csrf = $rootScope.sailsSocket._csrf;
    return $q(function (resolve, reject) {
      io.socket.put(where, what, function(data, response) {
        return (response.statusCode < 400) ? resolve(data) : reject(data);
      });
    });
  };

  this.get('/csrfToken').then(function (response) {
    $rootScope.sailsSocket._csrf = response._csrf;
  });

}]);
