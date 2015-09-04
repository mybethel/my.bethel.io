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

  this.editable = function(scope, what, editableFields, cb) {
    cb = cb || function(){}
    scope.$watch(what, function (newValue, oldValue) {
      if (!newValue || !oldValue) return;
      var payload = {};

      for (var i = 0, len = editableFields.length; i < len; i++) {
        var field = editableFields[i];

        if (angular.isUndefined(newValue[field]) || angular.isUndefined(oldValue[field]) || newValue[field].toString() === oldValue[field].toString()) {
          continue;
        }

        payload[field] = newValue[field];
      }

      if (Object.keys(payload).length <= 0) return;
      payload._csrf = $rootScope.sailsSocket._csrf;
      io.socket.put('/' + what + '/' + scope[what].id, payload, cb);
    }, true);
  };

  var findIndexById = function(arr, id) {
    var found = null;
    angular.forEach(arr, function(value, index) {
      if (value.id === id) found = index;
    });
    return found;
  };

  this.sync = function(scope, model, cb) {
    if (Array.isArray(scope)) {
      return this.syncMany(scope, model, cb);
    }

    this.syncOne(scope, model, cb);
  };

  this.syncOne = function(scope, model, cb) {
    io.socket.on(model, function (message) {
      if (scope.id !== message.id || message.verb !== 'updated')
        return;

      for (field in message.data) {
        if (message.data.hasOwnProperty(field)) {
          if (field === '_csrf') continue;
          scope[field] = message.data[field];
        }
      }

      $rootScope.$apply();
      if (typeof cb === 'function') cb();
    });
  };

  this.syncMany = function(scope, model, cb) {
    // Example messages:
    //   {model: "task", verb: "created", data: Object, id: 25}
    //   {model: "task", verb: "updated", data: Object, id: 3}
    //   {model: "task", verb: "destroyed", id: 20}
    io.socket.on(model, function (message) {

      switch(message.verb) {

        case 'created':
          if (findIndexById(scope, message.id) !== null) return;
          scope.unshift(message.data);
          break;

        case 'destroyed':
          var deleteIndex = findIndexById(scope, message.id);
          if (deleteIndex !== null) {
            scope.splice(deleteIndex, 1);
          }
          break;

        case 'updated':
          var updateIndex = findIndexById(scope, message.id);
          if (updateIndex !== null) {
            angular.extend(scope[updateIndex], message.data);
          }
          break;

        default: return console.log('Unhandled socket action: ' + message.verb);

      }
      $rootScope.$apply();
      if (typeof cb === 'function') cb();
    });
  };

}]);
