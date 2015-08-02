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
module.exports = {
	dev: {
		options: {
			paths: ['assets/components', 'assets/features']
		},
		files: {
			'.tmp/public/styles/app.css': 'assets/styles/app.less',
			'.tmp/public/styles/vjs-embed.css': 'assets/styles/vjs-embed.less',
			'.tmp/public/styles/embed.css': 'assets/styles/embed.less'
		}
	}
};
