/**
 * Install Bower dependencies.
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = function(grunt) {

  grunt.config.set('bower-install-simple', {
    dev: {
      config: {
        directory: 'assets/components'
      }
    }
  });

  grunt.loadNpmTasks('grunt-bower-install-simple');
};
