module.exports = function (grunt) {
    'use strict';

    // show elapsed time at the end
    require('time-grunt')(grunt);

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        config: {
            app: 'app',
            dist: 'dist/app',
            package: 'dist/package',
            paths: {
                js: '<%= config.app %>/js/*.js',
                html: '<%= config.app %>/pages/*.html',
                less: '<%= config.app %>/styles/app.less',
                locales: '<%= config.app %>/_locales/**/*.json'
            },

            banner: '/*!\n' +
                    ' * REST Console v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
                    ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                    ' * Licensed under <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' +
                    ' */\n\n'
        },

        /**
         * Minification
         */
        less: {
            dist: {
                options: {
                    compress: true
                },

                files: {
                    '<%= config.dist %>/app.css': '<%= config.paths.less %>'
                }
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{png,jpg}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeEmptyAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    collapseBooleanAttributes: true
                },

                files: {
                    '<%= config.dist %>/index.html': '<%= config.app %>/pages/index.html',
                    '<%= config.dist %>/options.html': '<%= config.app %>/pages/options.html'
                }
            }
        },

        uglify: {
            app: {
                options: {
                    banner: '<%= config.banner %>'
                },

                files: {
                    '<%= config.dist %>/js/app.js': [
                        '<%= config.paths.js %>',
                    ]
                }
            },

            libs: {
                files: {
                    '<%= config.dist %>/js/libs.js': [
                        'bower_components/jquery/jquery.js',
                        'bower_components/uri.js/src/URI.js',
                        'bower_components/bootstrap/js/transition.js',
                        'bower_components/bootstrap/js/tab.js',
                        'bower_components/bootstrap/js/button.js',

                        'bower_components/httparchive.js/dist/HTTPArchive.js',

                        'bower_components/chrome-platform-analytics/google-analytics-bundle.js',

                        'bower_components/crypto-js/rollups/md5.js'
                    ],
                }
            }
        },

        minjson: {
            dist: {
                files: [
                    {
                        src: '<%= config.app %>/manifest.json',
                        dest: '<%= config.dist %>/manifest.json'
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/_locales/',
                        src: ['**/*.json'],
                        dest: '<%= config.dist %>/_locales/'
                    }
                ]
            }
        },

        /**
         * Linting
         */
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            dist: ['Gruntfile.js', '<%= config.paths.js %>'],
        },

        lesslint: {
            dist: {
                files: {
                    src: ['<%= config.paths.less %>']
                },

                options: {
                    csslint: {
                        'ids': false,
                        'box-model': false,
                        'duplicate-properties': false,
                        'compatible-vendor-prefixes': false,
                        'qualified-headings': false,
                        'unique-headings': false,
                        'unqualified-attributes': false
                    }
                }
            }
        },

        htmlint: {
            options: {
                relaxerror: [
                    'The for attribute of the label element must refer to a form control.',
                    'Attribute i18n not allowed on element [a-z1-9]+ at this point.'
                ]
            },

            files: {
                src: ['<%= config.paths.html %>']
            }
        },

        jsonlint: {
            dist: {
                src: ['<%= config.app %>/manifest.json', '<%= config.paths.locales %>']
            }
        },

        /**
         * Testing
         */
        qunit: {
            options: {
                '--web-security': 'no',
                coverage: {
                    src: ['app/js/*.js'],
                    instrumentedFiles: 'tmp/',
                    htmlReport: 'test/report/coverage',
                    lcovReport: 'test/report/lcov',
                    linesThresholdPct: 0
                }
            },

            all: ['test/*.html']
        },

        coveralls: {
            all: {
                src: 'test/report/lcov/lcov.info'
            }
        },

        /**
         * Misc
         */
        copy: {
            fonts: {
                files: [{
                    expand: true,
                    flatten: true,
                    filter: 'isFile',
                    src: ['<%= config.app %>/fonts/**', 'bower_components/bootstrap/dist/fonts/**'],
                    dest: '<%= config.dist %>/fonts'
                }]
            }
        },

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= config.banner %>'
                },

                files: {
                    src: ['<%= config.dist %>/app.css']
                }
            }
        },

        clean: {
            dist: ['<%= config.dist %>', 'htmlint-report.json'],
            libs: ['bower_components', 'node_modules']
        },

        watch: {
            options: {
                spawn: false,
                livereload: true,
            },

            json: {
                files: ['<%= config.app %>/manifest.json', '<%= config.app.locales %>'],
                tasks: ['jsonlint', 'minjson']
            },

            scripts: {
                files: ['<%= config.paths.js %>'],
                tasks: ['jshint', 'uglify']
            },

            css: {
                files: ['<%= config.paths.less'],
                tasks: ['lesslint', 'less']
            },

            html: {
                files: ['<%= config.paths.html %>'],
                tasks: ['htmllint', 'htmlmin']
            }
        },

        bump: {
            options: {
                part: 'minor',
                onBumped: function( data ) {
                    if ( data.index === 0 ) {
                        grunt.config( 'pkg.version', data.version );
                    }
                }
            },

            files: ['package.json', 'bower.json', '<%= config.app %>/manifest.json']
        },

        compress: {
            dist: {
                options: {
                    archive: '<%= config.package %>/<%= pkg.name %> v<%= pkg.version %>.zip'
                },

                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['**'],
                    dest: ''
                }]
            }
        }
    });

    grunt.registerTask('default', [
        'test',
        'build'
    ]);

    grunt.registerTask('test', [
        'jshint',
        'jsonlint',
        'lesslint',
        'htmlint',
        'qunit'
    ]);

    grunt.registerTask('build', [
        'clean:dist',

        'less',
        'uglify',
        'minjson',
        'htmlmin',
        'imagemin',

        'copy',
        'usebanner',
    ]);

    grunt.registerTask('release', [
        'bump::patch',
        'default',
        'compress'
    ]);

    grunt.registerTask('travis', 'release');
};
