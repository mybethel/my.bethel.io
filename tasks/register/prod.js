module.exports = function (grunt) {
	grunt.registerTask('prod', [
		'compileAssets',
		'concat',
		'comments',
		'uglify',
		'cssmin',
		'sails-linker:prodJs',
		'sails-linker:prodStyles'
	]);
};
