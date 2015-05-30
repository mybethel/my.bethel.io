module.exports = function (grunt) {
  grunt.registerTask('default', ['compileAssets', 'concat', 'linkAssets',  'watch']);
};
