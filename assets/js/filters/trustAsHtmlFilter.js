angular.module('Bethel.media')

.filter('trustAsHtml', function ($sce) {
  return $sce.trustAsHtml;
});
