/**
 * Google Maps: Address Autocomplete directive for Angular
 * Credit to: https://gist.github.com/kirschbaum/fcac2ff50f707dae75dc
 * Uses the angular-google-maps module asynchronous Google Maps loader.
 **/
angular.module('Bethel.util')
.directive('addressAutocomplete', ['uiGmapGoogleMapApi',
  function(uiGmapGoogleMapApi) {

  return {
    require: 'ngModel',
    scope: {
      ngModel: '=',
      details: '=?'
    },
    link: function(scope, element, attrs, model) {
      var options = {
        types: [],
        componentRestrictions: {}
      };

      uiGmapGoogleMapApi.then(function (maps) {
        scope.gPlace = new maps.places.Autocomplete(element[0], options);

        maps.event.addListener(scope.gPlace, 'place_changed', function() {
          scope.$apply(function() {
            scope.details = scope.gPlace.getPlace();
            model.$setViewValue(element.val());
          });
        });
      });
    }
  };

}]);
