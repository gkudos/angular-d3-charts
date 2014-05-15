/*global module:false*/
module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '(function() {\n\n"use strict";\n\n',
        footer: '\n}());',
        stripBanners: true
      },
      dist: {
        src: [
          'src/directives/bar.js',
          'src/services/d3Helpers.js',
          'src/services/barDefaults.js',
          'src/services/barHelpers.js',
          'src/services/svgHelpers.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    connect: {
      options: {
        base: ''
      },
      webserver: {
        options: {
          port: 8888,
          keepalive: true
        }
      },
      devserver: {
        options: {
          port: 8888
        }
      },
      testserver: {
        options: {
          port: 9999
        }
      },
      coverage: {
        options: {
          base: 'coverage/',
          directory: 'coverage/',
          port: 5555,
          keepalive: true
        }
      }
    },

    open: {
      devserver: {
        path: 'http://localhost:8888'
      },
      coverage: {
        path: 'http://localhost:5555'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        browser: true,
        indent: 4,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        smarttabs: true,
        quotmark: 'single',
        globals: {
          angular: false,
          d3: false
        }
      },
      source: {
        src: ['src/directives/*.js', 'src/services/*.js']
      },
      tests: {
        src: ['test/unit/*.js', 'test/e2e/*.js'],
      },
      gruntfile: {
        src: 'Gruntfile.js',
        options: {
          globals: {
            require: false
          }
        }
      }
    },
    watch: {
      options : {
        livereload: 7777
      },
      source: {
        files: ['src/**/*.js'],
        tasks: [
          'jshint:source',
          'concat:dist',          
          'uglify',
          //'test:unit',
          //'concat:license'
        ]
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['watch:source']);

  //development
  grunt.registerTask('dev', ['connect:devserver', 'open:devserver', 'watch:source']);
};