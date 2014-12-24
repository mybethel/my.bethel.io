angular.module('Bethel.dashboard')

.controller('DashboardController', function ($rootScope, $scope, uiGmapGoogleMapApi) {

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

});
