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

  this.editable = function(scope, what, editableFields) {
    scope.$watch(what, function (newValue, oldValue) {
      if (!newValue || !oldValue) return;
      var payload = {};

      for (var i = 0, len = editableFields.length; i < len; i++) {
        var field = editableFields[i];
        if (newValue[field] === oldValue[field]) continue;
        payload[field] = newValue[field];
      }

      if (Object.keys(payload).length <= 0) return;
      payload._csrf = $rootScope.sailsSocket._csrf;
      io.socket.put('/' + what + '/' + scope[what].id, payload);
    }, true);
  };

  var findIndexById = function(arr, id) {
    var found = null;
    angular.forEach(arr, function(value, index) {
      if (value.id == id) found = index;
    });
    return found;
  };

  this.sync = function(scope, model) {
    // Example messages:
    //   {model: "task", verb: "created", data: Object, id: 25}
    //   {model: "task", verb: "updated", data: Object, id: 3}
    //   {model: "task", verb: "destroyed", id: 20}
    io.socket.on(model, function (data) {
      console.log(data);
      switch(data.verb) {

        case 'created':
          scope.unshift(data.data);
          break;

        case 'destroyed':
          var deleteIndex = findIndexById(scope, data.id);
          if (deleteIndex !== null) {
            scope.splice(deleteIndex, 1);
          }
          break;

        case 'updated':
          var updateIndex = findIndexById(scope, data.id);
          if (updateIndex !== null) {
            angular.extend(scope[updateIndex], data.data);
          }
          break;

        default: return console.log('Unhandled socket action: ' + data.verb);

      }
      $rootScope.$apply();
    });
  };

}]);
