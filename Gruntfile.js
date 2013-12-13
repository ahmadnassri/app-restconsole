module.exports = function(grunt) {
    // Displays the elapsed execution time of grunt tasks
    require('time-grunt')(grunt);

    // Load NPM Tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        application: '',
        extension: '',

        concat: {
            dist: {
                files: {
                    'dist/application/app.js': [
                        'vendor/jquery.js',
                        'vendor/bootstrap/js/transition.js',
                        'vendor/bootstrap/js/tab.js',
                        'vendor/bootstrap/js/button.js',

                        'application/js/app.js',
                    ],
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                    'dist/application/app.js': 'dist/application/app.js'
                }
            }
        },

        minjson: {
            dist: {
                files: [
                    {
                        src: 'application/manifest.json',
                        dest: 'dist/application/manifest.json'
                    },
                    {
                        expand: true,
                        cwd: 'application/_locales/',
                        src: ['**/*.json'],
                        dest: 'dist/application/_locales/'
                    }
                ]
            }
        },

        less: {
            dev: {
                options: {
                    paths: ['application/styles']
                },

                files: {
                    'dist/application/app.css': 'application/styles/app.less'
                }
            },

            dist: {
                options: {
                    paths: ['application/styles'],
                    cleancss: true
                },

                files: {
                    'dist/application/app.css': 'application/styles/app.less'
                }
            }
        },

        imagemin: {
            png: {
                options: {
                    optimizationLevel: 7
                },

                files: [{
                    expand: true,
                    cwd: 'application/images/',
                    src: ['**/*.png'],
                    dest: 'dist/application/images/'
                }]
            },

            jpg: {
                options: {
                    progressive: true
                },

                files: [{
                    expand: true,
                    cwd: 'application/images/',
                    src: ['**/*.jpg'],
                    dest: 'dist/application/images/'
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
                    'dist/application/index.html': 'application/pages/index.html',
                    'dist/application/options.html': 'application/pages/options.html'
                }
            }
        },

        jshint: {
            beforeconcat: ['Gruntfile.js', 'application/js/*.js'],
            afterconcat: ['dist/application/app.js'],
            options: {
                curly:   true,
                eqeqeq:  true,
                immed:   true,
                latedef: true,
                newcap:  true,
                noarg:   true,
                sub:     true,
                undef:   true,
                boss:    true,
                eqnull:  true,
                browser: true,

                globals: {
                    // AMD
                    require:    true,
                    module:     true,

                    // Environments
                    $:          true,
                    console:    true,
                    jQuery:     true,
                }
            }
        },

        watch: {
            options: {
                livereload: true,
            },

            scripts: {
                files: ['application/js/*.js'],
                tasks: ['concat'],
                options: {
                    spawn: false,
                },
            },

            css: {
                files: ['application/styles/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false,
                }
            },

            html: {
                files: ['application/*.html'],
                tasks: ['htmlmin'],
                options: {
                    spawn: false,
                }
            }
        }
    });

    grunt.registerTask('default', ['htmlmin', 'minjson', 'less:dev', 'jshint:beforeconcat', 'concat']);

    grunt.registerTask('release', ['htmlmin', 'minjson', 'less:dist', 'jshint:beforeconcat', 'concat', /*'jshint:afterconcat',*/ 'uglify', 'imagemin']);
};
