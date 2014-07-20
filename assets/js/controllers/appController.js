app.controller('AppController', function ($scope, sailsSocket, $log, filterFilter) {

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
    { title: 'Connected Accounts', url: '/accounts' },
    { title: 'Settings', url: '/ministry/edit' },
    { title: 'Locations', url: '/#/dashboard/locations' }
  ];

});