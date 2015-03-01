/**
 * Strip comments from files.
 */
module.exports = function(grunt) {

  grunt.config.set('comments', {
    js: {
      src: [ '.tmp/public/concat/dependencies.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-stripcomments');
};
