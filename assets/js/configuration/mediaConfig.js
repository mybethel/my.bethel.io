angular.module('Bethel.media', [
  'ui.router',
  'angularFileUpload'
])

.config(['$stateProvider', '$translatePartialLoaderProvider', function ($stateProvider, $translatePartialLoaderProvider) {

  $translatePartialLoaderProvider.addPart('media');

  $stateProvider
    .state('media', {
      url: '/media',
      templateUrl: 'templates/media/index.html',
      controller: 'MediaListController'
    })
    .state('media.collection', {
      url: '/:collectionId',
      templateUrl: 'templates/media/collection.html',
      controller: 'MediaCollectionController'
    })
    .state('media.collection.edit', {
      url: '/edit',
      templateUrl: 'templates/media/collection.edit.html',
      controller: 'MediaCollectionEditController'
    })
    .state('media.view', {
      url: '/view/:mediaId',
      templateUrl: 'templates/media/view.html',
      controller: 'MediaViewController'
    });

}]);
