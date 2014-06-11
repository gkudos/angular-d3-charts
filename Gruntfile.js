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
    shell: {
      options: {
        stdout: true
      },
      selenium: {
        command: 'node_modules/protractor/bin/webdriver-manager start',
        options: {
          stdout: false,
          async: true
        }
      },
      protractor_update: {
        command: 'node_modules/protractor/bin/webdriver-manager update'
      },
      npm_install: {
        command: 'npm install'
      }
    },
    bower: {
      install: {}
    },
    concat: {
      options: {
        banner: '(function() {\n\n"use strict";\n\n',
        footer: '\n}());',
        stripBanners: true
      },
      dist: {
        src: [
          'src/directives/bar.js',
					'src/directives/oneAxisBar.js',
					'src/directives/pie.js',
					'src/directives/line.js',
          'src/services/d3Helpers.js',
          'src/services/iconHelpers.js',
          'src/services/barDefaults.js',
					'src/services/pieDefaults.js',
					'src/services/lineDefaults.js',
          'src/services/barHelpers.js',
					'src/services/pieHelpers.js',
					'src/services/lineHelpers.js',
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
          port: 8888,
          livereload: true
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
        path: 'http://localhost:8888/examples',
        app: 'firefox'
      },
      coverage: {
        path: 'http://localhost:5555'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
				report: 'gzip'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        browser: true,
        jquery: true,
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
          d3: false,
        },
        reporter: require('jshint-stylish')
      },
      source: {
        src: ['src/directives/*.js', 'src/services/*.js']
      },
      tests: {
        src: ['test/unit/*.js', 'test/e2e/*.js'],

				options: {
					globals: {
						angular: false,
						d3: false,

						// Jasmine
						jasmine : false,
						isCommonJS : false,
						exports : false,
						spyOn : false,
						it : false,
						xit : false,
						expect : false,
						runs : false,
						waits : false,
						waitsFor : false,
						beforeEach : false,
						afterEach : false,
						describe : false,
						xdescribe : false,
            protractor: false,
            browser: false,
            element: false,
            by: false,

						// Angular mocks
						module: false,
						inject: false
					}
				}
      },
      gruntfile: {
        src: 'Gruntfile.js',
        options: {
          indent: false,

          globals: {
            require: false
          }
        }
      }
    },
		karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        autoWatch: false,
        singleRun: true
      }
		},
    protractor: {
      options: {
        keepAlive: false,
        configFile: 'test/protractor.conf.js',
        args: {
          specs: [ 'test/e2e/*.js' ],
        }
      },
      run: {},
    },
    watch: {
      options : {
        livereload: 7777
      },
      source: {
        files: ['src/**/*.js', 'test/unit/**.js', 'test/e2e/**.js'],
        tasks: [
          'jshint:source',
					'jshint:tests',
          'concat:dist',
          'uglify',
          'test:unit',
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
	grunt.registerTask('test', ['jshint','test:unit', 'test:e2e']);
  grunt.registerTask('test:unit', ['karma:unit']);
	grunt.registerTask('test:e2e', ['shell:protractor_update', 'connect:testserver', 'protractor:run']);
  grunt.registerTask('test:e2e-firefox', ['shell:protractor_update', 'connect:testserver', 'protractor:firefox']);

  //development
  grunt.registerTask('dev', ['connect:devserver', 'open:devserver', 'watch:source']);
	grunt.registerTask('build', ['jshint:source', 'concat:dist', 'uglify']);
	grunt.registerTask('travis', ['build', 'test']);

  //installation-related
  grunt.registerTask('install', ['shell:npm_install', 'bower:install', 'shell:protractor_update']);
};
