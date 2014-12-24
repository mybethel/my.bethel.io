angular.module('Bethel')

.filter('trustAsHtml', function ($sce) {
  return $sce.trustAsHtml;
});
