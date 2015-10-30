angular.module('Bethel.util').filter('imageResize', function() {
  return function(url, width, height, defaultImage) {

    var hostname = 'https://images.bethel.io/images/',
        instructions = '?crop=entropy&fit=crop&w=' + width + '&h=' + height,
        image = url;

    if (!image) image = defaultImage;

    return hostname + image + instructions;

  };
});
