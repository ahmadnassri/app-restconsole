module.exports = function(grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        banner: '/*!\n' +
              ' * REST Console v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
              ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              ' * Licensed under <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' +
              ' */\n\n',

        clean: {
            dist: ['dist'],
            all: ['dist', 'bower_components', 'node_modules']
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
            options: {
                banner: '<%= banner %>'
            },

            dist: {
                files: {
                    'dist/application/app.js': [
                        'bower_components/jquery/jquery.js',
                        'bower_components/uri.js/src/URI.js',
                        'bower_components/bootstrap/js/transition.js',
                        'bower_components/bootstrap/js/tab.js',
                        'bower_components/bootstrap/js/button.js',

                        'bower_components/chrome-platform-analytics/google-analytics-bundle.js',

                        'bower_components/crypto-js/rollups/md5.js',

                        'application/js/*.js',
                    ],
                }
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
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

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '<%= banner %>'
                },

                files: {
                    src: ['dist/application/app.css']
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
            options: {
                jshintrc: '.jshintrc'
            },

            development: ['Gruntfile.js', 'application/js/*.js'],
            //'tests/test.js'
            production: ['dist/application/app.js'],
        },

        lesslint: {
            dist: {
                files: {
                    src: ['application/styles/*.less']
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

        qunit: {
            all: ['tests/*.html']
        },

        validation: {
            options: {
                charset: 'utf-8',
                doctype: 'HTML5',
                failHard: true,
                reset: true,
                relaxerror: [
                    'The for attribute of the label element must refer to a form control.',
                    'Attribute i18n not allowed on element [a-z1-9]+ at this point.'
                    //'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
                    //'Element img is missing required attribute src.'
                ]
            },

            files: {
                src: ['application/pages/*.html']
            }
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
                tasks: ['jshint:development', 'concat'],
                options: {
                    spawn: false,
                }
            },

            css: {
                files: ['application/styles/*.less'],
                tasks: ['less', 'lesslint', 'usebanner'],
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
        'usebanner',
        'lesslint',
        'jshint:development',
        'concat',
        'copy:images',
        'copy:fonts'
    ]);

    grunt.registerTask('release', [
        'validation',
        'htmlmin',
        'minjson',
        'less:dist',
        'lesslint',
        'jshint:development',
        'concat',
        'jshint:prodution',
        'uglify',
        'imagemin',
        'copy:fonts'
    ]);

    grunt.registerTask('travis', 'release');
};
