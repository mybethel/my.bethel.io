angular.module('Bethel.util').component('topNav', {
  bindings: {
    ministry: '<',
    ministries: '<',
    user: '<'
  },
  templateUrl: 'interface/topNav.template.html',
  controller: TopNavComponent
});

/** @class TopNavComponent */
function TopNavComponent($rootScope) {

  var $ctrl = this;

  /**
   * Called whenever the route changes to update the title of the navbar. The
   * title that is used comes from the state configuration for that route.
   * @see {@link https://github.com/angular-ui/ui-router/wiki#state-change-events}
   * @method $stateChangeSuccess
   * @memberof TopNavComponent
   */
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
    if (!toState.data || !toState.data.pageTitle) {
      $ctrl.title = '';
      return;
    }
    $ctrl.title = toState.data.pageTitle;
  });

}

TopNavComponent.$inject = ['$rootScope'];
