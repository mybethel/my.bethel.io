/**
 * Gruntfile
 *
 * This Node script is executed when you run `grunt` or `sails lift`.
 * It's purpose is to load the Grunt tasks in your project's `tasks`
 * folder, and allow you to add and remove tasks as you see fit.
 * For more information on how this works, check out the `README.md`
 * file that was generated in your `tasks` folder.
 *
 * WARNING:
 * Unless you know what you're doing, you shouldn't change this file.
 * Check out the `tasks` directory instead.
 */

module.exports = function(grunt) {


  // Load the include-all library in order to require all of our grunt
  // configurations and task registrations dynamically.
  var includeAll;
  try {
    includeAll = require('include-all');
  } catch (e0) {
    try {
      includeAll = require('sails/node_modules/include-all');
    }
    catch(e1) {
      console.error('Could not find `include-all` module.');
      console.error('Skipping grunt tasks...');
      console.error('To fix this, please run:');
      console.error('npm install include-all --save`');
      console.error();

      grunt.registerTask('default', []);
      return;
    }
  }


  /**
   * Loads Grunt configuration modules from the specified
   * relative path. These modules should export a function
   * that, when run, should either load/configure or register
   * a Grunt task.
   */
  function loadTasks(relPath) {
    return includeAll({
      dirname: require('path').resolve(__dirname, relPath),
      filter: /(.+)\.js$/
    }) || {};
  }

  /**
   * Loads the function from a Grunt configuration module. If the module is a
   * function, it will be invoked with a single argument - the `grunt` object.
   * Otherwise, the value returned by the module will be used to call
   * `grunt.config.set` or `grunt.registerTask` with the module name.
   */
  function invokeConfig(mode) {
    var tasks = loadTasks('./tasks/' + mode);
    for (var task in tasks) {
      if (tasks.hasOwnProperty(task)) {
        if (typeof tasks[task] === 'function') {
          tasks[task](grunt);
          continue;
        }

        if (mode === 'config') {
          grunt.config.set(task, tasks[task]);
        } else if (mode === 'register') {
          grunt.registerTask(task, tasks[task]);
        }
      }
    }
  }

  // Run task functions to configure Grunt.
  invokeConfig('config');

  try {
    require('load-grunt-tasks')(grunt);
  } catch (e) {
    grunt.log.error('Could not find `load-grunt-tasks` module.');
    grunt.log.error('Perhaps you forgot to run `npm install`?');
    return;
  }

  invokeConfig('register');

  // (ensure that a default task exists)
  if (!grunt.task.exists('default')) {
    grunt.registerTask('default', []);
  }

};
