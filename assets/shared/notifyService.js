angular.module('Bethel.util').service('notifyService', ['$mdToast', function ($mdToast) {

  this.commonAlerts = {
    saved: 'Your changes have been saved!',
  };

  this.showCommon = function(type) {
    if (!this.commonAlerts[type]) return;

    $mdToast.show($mdToast.simple()
      .content(this.commonAlerts[type])
      .position('bottom right')
      .hideDelay(3000));
  };

}]);
