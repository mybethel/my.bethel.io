/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = {
	libraries: {
		src: require('../pipeline').librariesToInject,
		dest: '.tmp/public/concat/libraries.js',
	},
	frontend: {
		src: require('../pipeline').frontendToInject,
		dest: '.tmp/public/concat/frontend.js'
	},
	js: {
		src: require('../pipeline').jsFilesToInject,
		dest: '.tmp/public/concat/production.js'
	},
	css: {
		src: require('../pipeline').cssFilesToInject,
		dest: '.tmp/public/concat/production.css'
	},
	prod: {
		src: [
			'.tmp/public/concat/libraries.js',
			'.tmp/public/min/frontend.min.js'
		],
		dest: '.tmp/public/min/production.min.js'
	}
};
