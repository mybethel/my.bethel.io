app.controller('DashboardController', function ($scope, sailsSocket, $log, filterFilter) {

  $scope.map = {
    zoom: 10,
    bounds: new google.maps.LatLngBounds(),
    center: [30.25, -97.75],
    options: {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
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

  $scope.$on('sailsSocket:connect', function (ev, data) {
    sailsSocket.get('/dashboard/stats', {}, function (response, status) {
      $scope.stats = response;
    });
    sailsSocket.get('/location/ministry', {}, function (response, status) {
      $scope.locations = [];
      response.forEach(function(val, key) {
        $scope.locations.push({
          id: key,
          position: {
            longitude: val.loc[0],
            latitude: val.loc[1],
          },
          icon: 'https://s3.amazonaws.com/static.bethel.io/images/pin.png',
          title: val.name
        });
      });
    });
  });

});