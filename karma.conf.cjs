// Karma configuration
// Generated on Sat Mar 27 2021 18:49:28 GMT+0100 (Midden-Europese standaardtijd)

const path = require('path');
const fs = require('fs');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: __dirname,


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],

    customContextFile: './karma_tests_contextfile.html',
    customDebugFile: './karma_tests_debugfile.html',
    // list of files / patterns to load in the browser
    files: [
      { pattern: './karma_test_prepend.js', type: 'js', included: true },
      { pattern: './node_modules/jquery/dist/*.js', type: 'js', include: false },
      { pattern: './core/**/*.js', type: 'module', included: false },
      { pattern: './responder/**/*.js', type: 'module', included: false },
      { pattern: './event/**/*.js', type: 'module', included: false },
      { pattern: './view/**/*.js', type: 'module', included: false },
      { pattern: './tests/qunit/*.js', type: 'js', included: false },
      // { pattern: './tests/core/**/*.js', type: 'module' },
      { pattern: './tests/event/**/*.js', type: 'module' },
      // { pattern: './tests/responder/**/*.js', type: 'module' },
      // { pattern: './tests/statechart/**/*.js', type: 'module' },
      // { pattern: './tests/testing/**/*.js', type: 'module' },
      // { pattern: './tests/view/**/*.js', type: 'module' },
      // { pattern: './**/*.css', included: true, watched: false }
    ],

    client: {
      clearContext: false,
      useIframe: true,
      qunit: {
        showUI: true,
        autostart: false
        // testTimeout: 5000,
        // included: false,
      }
    },

    // list of files / patterns to exclude
    exclude: [
      './tests/core/scworker/*.js',
      './tests/app.js',
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    // preprocessors: {
    //   'tests/**/*.js': ['webpack']
    // },

    // webpack: {
    //   entry: {
    //     qunit: {
    //       import: 'tests/qunit/qunit-2.11.3.js'
    //     }
    //   }
    // },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome', 'ChromeHeadless', 'Firefox', 'Safari', 'Opera'],
    // browsers: ['Chrome', 'Firefox'],
    // browsers: ['Chromium', 'Firefox'],
    browsers: ['Chromium'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
