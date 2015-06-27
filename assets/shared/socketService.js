angular.module('Bethel.util').service('$socket', ['$q', '$rootScope', function ($q, $rootScope) {

  $rootScope.$io = {
    _csrf: '',
    outstanding: 0
  };

  var populateQuery = function(from, params, type) {
    if (from[0] !== '/') from = '/'.concat(from);
    $rootScope.$io.outstanding++;
    var result = (type === 'list') ? [] : {};
    io.socket.get(from, params, function (data) {
      angular.forEach(data, function (item, index) {
        if (type === 'list') {
          result.push(item);
        } else {
          result[index] = item;
        }
      });
      $rootScope.$io.outstanding--;
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
    what._csrf = $rootScope.$io._csrf;
    return $q(function (resolve, reject) {
      io.socket.post(where, what, resolve);
    });
  };

  this.put = function(where, what) {
    what._csrf = $rootScope.$io._csrf;
    return $q(function (resolve, reject) {
      io.socket.put(where, what, resolve);
    });
  };

  this.get('/csrfToken').then(function (response) {
    $rootScope.$io._csrf = response._csrf;
  });

}]);
