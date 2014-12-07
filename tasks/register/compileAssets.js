module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'less:dev',
    'sass:dev',
    'copy:dev',
    'coffee:dev'
	]);
};
