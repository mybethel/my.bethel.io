angular.module('Bethel.util').component('topNav', {
  bindings: {
    title: '<',
    ministry: '<',
    ministries: '<',
    user: '<'
  },
  templateUrl: 'interface/topNav.component.html'
});
