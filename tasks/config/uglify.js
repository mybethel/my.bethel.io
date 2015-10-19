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
    files: {
      '.tmp/public/min/frontend.min.js': '.tmp/public/concat/frontend.js',
      '.tmp/public/min/embed.min.js': '.tmp/public/js/embed.js'
    }
  }
};
