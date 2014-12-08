/**
 * Compiles LESS files into CSS.
 *
 * ---------------------------------------------------------------
 *
 * Only the `assets/styles/importer.less` is compiled.
 * This allows you to control the ordering yourself, i.e. import your
 * dependencies, mixins, variables, resets, etc. before other stylesheets)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-less
 */
module.exports = function(grunt) {

	grunt.config.set('less', {
		dev: {
			options: {
				paths: ['assets/components']
			},
			files: {
				'.tmp/public/styles/app.css': 'assets/styles/app.less'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
};
