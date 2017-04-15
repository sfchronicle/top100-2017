/*jshint node:true*/

// Generated on <%= (new Date).toISOString().split('T')[0] %> using
// <%= pkg.name %> <%= pkg.version %>
'use strict';

var path = require("path");
var fs = require("fs");
var url = require("url");

module.exports = function (grunt) {

  
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-open");
  grunt.loadNpmTasks("grunt-run");
  grunt.loadTasks("./tasks");

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        spawn: false,
        livereload: true
      },
      js: {
        files: ['static/scripts/**/*.js'],
        tasks: ['jshint']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      less: {
        files: ['static/styles/*.less'],
        tasks: ['less']
      },
      reload: {
        files: ['templates/**/*.html','static/images/**/*'],
        tasks: ['build','less']
      }
    },

    connect: {
      dev: {
        options: {
          hostname: "0.0.0.0",
          livereload: true,
          base: "./build",
          //middleware to protect against case-insensitive file systems
          middleware: function(connect, options, ware) {
            var base = options.base.pop();
            ware.unshift(function(req, response, next) {
              var href = url.parse(req.url).pathname;
              var location = path.join(base, href);
              var filename = path.basename(href);
              if (!filename) return next();
              var dir = path.dirname(location);
              fs.readdir(dir, function(err, list) {
                if (!err && list.indexOf(filename) == -1) {
                  response.statusCode = 404;
                  response.end("<pre>            404 Not Found\n-this space intentionally left blank-</pre>");
                } else {
                  next();
                }
              })
            });
            return ware;
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'static/scripts/**/*.js'
      ]
    },

    open: {
      dev: {
        path: 'http://127.0.0.1:5000'
      },
      prod: {
        path: 'http://projects.sfchronicle.com/2017/<%= grunt.data.json.project.production_path %>'
      }
    },

    // Run build.py file to serve static files 
    run: {
      options: {
        stdout: true,
        stderr: true,
      },
      staging: {
        exec: 'python build.py staging'
      },
      production: {
        exec: 'python build.py production'
      }
    },

    // Converts .html files to .php
    copy: {
      production: {
        files: [{
          expand: true,
          cwd: 'build/',
          src: ['**/*.html'],
          dest: 'build/',
          rename: function (dest, src) {
            return dest + src.replace('.html','.php');
          }
        }]
      }
    },

    // Deletes .html files from build folder
    clean: ['build/**/*.html']

  });



  // Bring up flask server
  grunt.registerTask('flask', 'Run flask server.', function() {
     var spawn = require('child_process').spawn;
     grunt.log.writeln('Starting Flask development server.');
     // stdio: 'inherit' let us see flask output in grunt
     var PIPE = {stdio: 'inherit'};
     spawn('python', ['main.py']);
  });

  grunt.registerTask('default', [
    'build',
    'less',
    'connect:dev',
    'watch'
  ]);

  // Build static files; defaults to staging. Command = 'grunt build:production'
  grunt.registerTask('build', function(target) {
    if (target) {
      grunt.task.run (['run:' + target]);
    } else {
      grunt.task.run(['run:staging']);
    }
  });

  // converts all .html files into .php files
  grunt.registerTask('php', function(target) {
    grunt.task.run (['copy', 'clean']);
  });

  /*
  This module sets up a `grunt.data` object to be used for shared state between
  modules on each run. Modules that use it should require this task to make sure
  that they get a clean state on each run. If Grunt starts emitting events,
  we'll use those to automatically initialize.
  */
  grunt.registerTask("state", "Initializes the shared state object", function() {
    grunt.data = {};
  });

  /*
  Loads the project.json file, as well as any matching files in the /data
  folder, and attaches it to the grunt.data object as grunt.data.json.
  */
  grunt.registerTask("json", "Load JSON for templating", function() {
    var files = grunt.file.expand(["project.json", "data/**/*.json"]);
    grunt.task.requires("state");
    grunt.data.json = {};

    files.forEach(function(file) {
      var json = grunt.file.readJSON(file);
      var name = path.basename(file).replace(/(\.sheet)?\.json$/, "");
      grunt.data.json[name] = json;
    });
  });

  // Deploys project to server. Defaults to staging folder
  grunt.registerTask('deploy', "Deployed project", function(target) {
    if (target) {
      grunt.task.run (['state', 'json', 'sync:' + target]);
    } else {
      grunt.task.run(['state', 'json', 'sync:staging']);
    }
  });


};