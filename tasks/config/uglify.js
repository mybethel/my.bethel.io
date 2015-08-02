/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = {
  dist: {
    src: ['.tmp/public/concat/production.js'],
    dest: '.tmp/public/min/production.min.js'
  }
};
