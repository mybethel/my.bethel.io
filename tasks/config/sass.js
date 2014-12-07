/**
 * Compiles SCSS files into CSS.
 *
 * ---------------------------------------------------------------
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-sass
 */
module.exports = function(grunt) {

  grunt.config.set('sass', {
    dev: {
      options: {
        style: 'expanded'
      },
      files: [{
        expand: true,
        cwd: 'assets/styles/',
        src: ['*.scss'],
        dest: '.tmp/public/styles/',
        ext: '.css'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');
};
