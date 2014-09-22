angular.module('Bethel.dashboard', ['ui.router', 'google-maps'])

.config(function ($stateProvider, $urlRouterProvider) {

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

})

.controller('DashboardController', function ($scope, sailsSocket, $log, filterFilter) {

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

  $scope.stats = [];
  $scope.locations = [];
  $scope.markers = [];

  $scope.init = function() {
    sailsSocket.get('/dashboard/stats', {}, function (response, status) {
    if (!response.error)
      $scope.stats = response;
    });
    sailsSocket.get('/location/ministry', {}, function (response, status) {
      if (!response.error)
        $scope.locations = response;
    });
  }

  // Watch for notifications to update the dashboard display.
  $scope.$on('event:update-dashboard', function() {
    $scope.init();
  });

  // Certain data is extracted from locations to build markers.
  $scope.$watch('locations', function() {
    $scope.markers = [];
    $scope.locations.forEach(function(location) {
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

});