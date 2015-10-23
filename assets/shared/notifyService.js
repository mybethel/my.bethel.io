angular.module('Bethel.util').service('notifyService', ['$mdToast', function ($mdToast) {

  this.beforeNotify = function(){};
  this.afterNotify = function(){};

  this.commonAlerts = {
    saved: 'Your changes have been saved!',
  };

  this.showCommon = function(type) {
    if (!this.commonAlerts[type] || !this.beforeNotify()) return;

    $mdToast.show($mdToast.simple()
      .content(this.commonAlerts[type])
      .position('bottom right')
      .hideDelay(3000));

    this.afterNotify();
  };

}]);
