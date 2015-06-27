angular.module('Bethel.util').service('sailsSocket', ['$q', '$rootScope', function ($q, $rootScope) {

  if (!io.socket) throw new Error('Missing required `sails.io.js` dependency.');

  $rootScope.sailsSocket = {
    _csrf: '',
    outstanding: 0
  };

  var populateQuery = function(from, params, type) {
    if (from[0] !== '/') from = '/'.concat(from);
    $rootScope.sailsSocket.outstanding++;
    var result = (type === 'list') ? [] : {};
    io.socket.get(from, params, function (data) {
      angular.forEach(data, function (item, index) {
        if (type === 'list') {
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
      io.socket.get(where, resolve);
    });
  };

  this.populate = function(from, params) {
    return populateQuery(from, params);
  };

  this.populateList = function(from, params) {
    return populateQuery(from, params, 'list');
  };

  this.post = function(where, what) {
    what._csrf = $rootScope.sailsSocket._csrf;
    return $q(function (resolve, reject) {
      io.socket.post(where, what, resolve);
    });
  };

  this.put = function(where, what) {
    what._csrf = $rootScope.sailsSocket._csrf;
    return $q(function (resolve, reject) {
      io.socket.put(where, what, resolve);
    });
  };

  this.get('/csrfToken').then(function (response) {
    $rootScope.sailsSocket._csrf = response._csrf;
  });

}]);
