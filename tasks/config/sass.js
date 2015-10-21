/**
 * Compiles SASS into CSS.
 *
 * For usage docs see:
 *     https://github.com/sindresorhus/grunt-sass
 */
module.exports = {
  options: {
    sourceMap: true
  },
  dist: {
    files: {
      '.tmp/public/styles/embed.css': 'assets/styles/embed.scss'
    }
  }
}
