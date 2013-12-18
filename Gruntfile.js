module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        application: '',
        extension: '',

        clean: {
            dist: ['dist'],
            all: ['bower_components', 'node_modules']
        },

        copy: {
            fonts: {
                files: [{
                    expand: true,
                    flatten: true,
                    filter: 'isFile',
                    src: ['application/fonts/**', 'bower_components/bootstrap/dist/fonts/**'],
                    dest: 'dist/application/fonts'
                }]
            },

            images: {
                files: [{
                    expand: true,
                    src: ['application/images/**'],
                    dest: 'dist/'
                }]
            }
        },

        concat: {
            dist: {
                files: {
                    'dist/application/app.js': [
                        'bower_components/jquery/jquery.js',
                        'bower_components/uri.js/src/URI.js',
                        'bower_components/har-to-curl/lib/har-to-curl.js',
                        'bower_components/bootstrap/js/transition.js',
                        'bower_components/bootstrap/js/tab.js',
                        'bower_components/bootstrap/js/button.js',

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
                jshintrc: '.jshintrc'
            }
        },

        qunit: {
            all: ['tests/*.html']
        },

        watch: {
            options: {
                livereload: true,
            },

            json: {
                files: ['application/manifest.json', 'application/_locales/**/*.json'],
                tasks: ['minjson'],
                options: {
                    spawn: false,
                }
            },

            scripts: {
                files: ['application/js/*.js'],
                tasks: ['jshint:beforeconcat', 'concat'],
                options: {
                    spawn: false,
                }
            },

            css: {
                files: ['application/styles/*.less'],
                tasks: ['less'],
                options: {
                    spawn: false,
                }
            },

            html: {
                files: ['application/pages/*.html'],
                tasks: ['htmlmin'],
                options: {
                    spawn: false,
                }
            }
        },

        bump: {
            files: ['package.json', 'bower.json', 'application/manifest.json']
        }
    });

    grunt.registerTask('default', [
        'htmlmin',
        'minjson',
        'less:dev',
        'jshint:beforeconcat',
        'concat',
        'copy:images',
        'copy:fonts'
    ]);

    grunt.registerTask('release', [
        'htmlmin',
        'minjson',
        'less:dist',
        'jshint:beforeconcat',
        'concat',
        /*'jshint:afterconcat',*/
        'uglify',
        'imagemin',
        'copy:fonts'
    ]);

    grunt.registerTask('travis', 'release');
};
