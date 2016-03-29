angular.module('Bethel.util')
.service('confirmDelete', ['$mdDialog', function ($mdDialog) {

  return function (options) {

    var defaultTitle = 'Are you sure?',
        defaultMessage = 'This ' + (options.type || 'item') + ' will be permanently deleted. This action cannot be undone.';

    var confirm = $mdDialog.confirm()
      .title(options.title ? options.title : defaultTitle)
      .content(options.message ? options.message : defaultMessage)
      .ok('Delete')
      .cancel('Cancel');

    return $mdDialog.show(confirm);
  };

}]);
