/**
 * Compress CSS files.
 *
 * ---------------------------------------------------------------
 *
 * Minifies css files and places them into .tmp/public/min directory.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-cssmin
 */
module.exports = {
  dist: {
    src: ['.tmp/public/concat/production.css'],
    dest: '.tmp/public/min/production.min.css'
  }
};
