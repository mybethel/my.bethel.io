module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'bower-install-simple:dev',
    'less:dev',
    'sass:dev',
    'copy:dev',
    'coffee:dev'
	]);
};
