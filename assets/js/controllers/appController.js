app.controller('AppController', function ($scope, sailsSocket, $log, $state, filterFilter) {

  $scope.redirect = '';
  $scope.user = {};
  $scope.ministry = {};

  $scope.$on('sailsSocket:connect', function (ev, data) {
    sailsSocket.get('/session/current', {}, function (response, status) {
      $scope.user = response.user;
      $scope.ministry = response.ministry;
    });
  });

  // Main navigation bar links.
  $scope.navLinks = [
    { title: 'Dashboard', icon: 'tachometer', url: '/' },
    { title: 'Podcasts', icon: 'microphone', url: '/podcasts' },
    { title: 'Mobile App', icon: 'mobile', url: '/mobile' },
    { title: 'Volunteers', icon: 'users', url: '/' },
    { title: 'Live Streaming', icon: 'video-camera', url: '/' },
    { title: 'Giving', icon: 'money', url: '/' },
    { title: 'Social Media', icon: 'thumbs-up', url: '/' }
  ];

  // Ministry dropdown menu.
  $scope.ministryLinks = [
    { title: 'Connected Accounts', url: '/#/dashboard/accounts' },
    { title: 'Settings', url: '/ministry/edit' },
    { title: 'Locations', url: '/#/dashboard/locations' }
  ];

  // Notification that login is required. 
  $scope.$on('event:auth-loginRequired', function() {
    if ($state.current.name != 'login')
      $scope.redirect = $state.current.name;

    $state.go('login');
  });

  // Notification that login was sucessful. 
  $scope.$on('event:auth-loginConfirmed', function() {

    sailsSocket.get('/session/current', {}, function (response, status) {
      $scope.user = response.user;
      $scope.ministry = response.ministry;
    });

    $state.go($scope.redirect !== '' ? $scope.redirect : 'dashboard');

  });

});