angular.module('Bethel.dashboard', ['ui.router', 'uiGmapgoogle-maps', 'angular-rickshaw'])

.config(function ($stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider) {

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard/dashboard.html',
      controller: 'DashboardController'
    })
    .state('dashboard.location', {
      url: '/locations',
      templateUrl: 'templates/dashboard/locations.html',
      controller: 'LocationController'
    })
    .state('dashboard.location.edit', {
      url: '/edit/:locationId',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationFormController'
    })
    .state('dashboard.location.new', {
      url: '/new',
      templateUrl: 'templates/dashboard/locations.form.html',
      controller: 'LocationFormController'
    })
    .state('dashboard.billing', {
      url: '/billing',
      templateUrl: 'templates/dashboard/billing.html'
    })
    .state('dashboard.accounts', {
      url: '/accounts',
      templateUrl: 'templates/dashboard/accounts.html',
      controller: 'AccountsController'
    });

  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyCasoNnO-7ZHrH_NBcCU_BBed6duq8NvJg',
    v: '3.17',
    libraries: 'places'
  });

})

.controller('DashboardController', function ($rootScope, $scope, $log, uiGmapGoogleMapApi) {

  uiGmapGoogleMapApi.then(function(maps) {
    $scope.map = {
      control: {},
      zoom: 10,
      bounds: new google.maps.LatLngBounds(),
      center: [30.25, -97.75],
      options: {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: false,
        panControl: false,
        mapTypeControl: false,
        scrollwheel: false,
        navigationControl: false,
        draggable: false,
        streetViewControl: false,
        maxZoom: 15,
      }
    };
  });

  $scope.stats = [];
  $scope.locations = [];
  $scope.markers = [];

  $scope.chart = {
    options: {
      renderer: 'line',
      width: 98,
      height: 73
    },
    draw: [{
      color: '#106982',
      data: [{x: 0, y: 10},{x: 1, y: 15}]
    }]
  };

  $scope.init = function() {
    io.socket.get('/dashboard/stats', function (response) {
      $scope.$apply(function() {
        $scope.stats = response;
      });
    });
    io.socket.get('/location/ministry', function (response) {
      $scope.$apply(function() {
        $scope.locations = response;
      });
    });
  };

  // Watch for notifications to update the dashboard display.
  $scope.$on('event:update-dashboard', function() {
    $scope.init();
  });

  $rootScope.$watch('ministry', function() {
    if (!$rootScope.ministry || !$rootScope.ministry.id)
      return;

    $scope.init();
  });

  // Certain data is extracted from locations to build markers.
  $scope.$watch('locations', function() {
    $scope.markers = [];
    $scope.locations.forEach(function (location) {
      $scope.markers.push({
        id: location.id,
        position: {
          longitude: location.loc[0],
          latitude: location.loc[1],
        },
        icon: 'https://s3.amazonaws.com/static.bethel.io/images/pin.png',
        title: location.name
      });
    });
  }, true);

  $scope.$watch('stats', function() {
    if (typeof $scope.stats.podcast === 'undefined')
      return;

    var chartData = [];

    $scope.stats.podcast.forEach(function (stat, i) {
      chartData.push({x: i, y: stat});
      i++;
    });

    $scope.chart.draw = [{
      color: '#106982',
      data: chartData
    }];
  });

  $scope.init();

  $scope.$on('sailsSocket:connect', function (ev, data) {
    $scope.init();
  });

  // Notification that login was sucessful. 
  $scope.$on('event:auth-loginConfirmed', function() {
    $scope.init();
  });

  $scope.$on('sailsSocket:location', function (ev, data) {

    // Example messages:
    //   {model: "task", verb: "created", data: Object, id: 25}
    //   {model: "task", verb: "updated", data: Object, id: 3}
    //   {model: "task", verb: "destroyed", id: 20}

    switch(data.verb) {

      case 'created':
        $scope.locations.unshift(data.data);
        break;

      case 'destroyed':
        var deleteIndex = findIndexByPropertyValue($scope.locations, 'id', data.id);
        if (deleteIndex !== null)
          $scope.locations.splice(deleteIndex, 1);
        break;

      case 'updated':
        var updateIndex = findIndexByPropertyValue($scope.locations, 'id', data.id);
        if (updateIndex !== null) {
          angular.extend($scope.locations[updateIndex], data.data);
        }
        break;

    }
  });

})

.controller('AccountsController', function ($scope, $log, filterFilter) {

  $scope.accounts = [];

  io.socket.get('/service/list', {}, function (response, status) {
    $scope.accounts = response;
  });

})

.controller('LocationController', function ($scope, $log, filterFilter) {

  $scope.addressFormat = function (string) {
    var address = string.split(',');
    address.pop();
    return address.join(',');
  };

})

.controller('LocationFormController', function ($rootScope, $scope, $state, $stateParams) {

  $scope.id = $stateParams.locationId;
  $scope.location = {};
  $scope.coords = '';

  // Generic save functionality for both new and existing locations.
  $scope.save = function () {
    if ($scope.id) {
      io.socket.put('/location/' + $scope.id, $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    } else {
      io.socket.post('/location/create', $scope.location, function (response) {
        $rootScope.$broadcast('event:update-dashboard');
        $state.go('dashboard.location');
      });
    }
  };

  // Google Places autocomplete functionality and geocoding.
  var locationData = new google.maps.places.Autocomplete((document.getElementById('location-autocomplete')), { types: ['geocode'] });
  google.maps.event.addListener(locationData, 'place_changed', function() {
    var place = locationData.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();

    $scope.location.address = place.formatted_address;
    $scope.location.latitude = lat;
    $scope.location.longitude = lng;
    $scope.coords = lat.toFixed(2) + ', ' + lng.toFixed(2);
  });

  if (!$scope.id) {
    // Get the CSRF token for validation.
    io.socket.get('/csrfToken', function (response) {
      $scope.location._csrf = response._csrf;
    });
    $scope.location.ministry = $rootScope.ministry.id;

    return;
  }

  // Query the location to display in the edit form.
  io.socket.get('/location/' + $scope.id, function (response) {
    $scope.location = response;
    delete $scope.location.ministry;

    if ($scope.location.loc)
      $scope.coords = $scope.location.loc[0].toFixed(2) + ', ' + $scope.location.loc[1].toFixed(2);

    // Get the CSRF token for validation.
    io.socket.get('/csrfToken', function (response) {
      $scope.location._csrf = response._csrf;
    });
  });

});