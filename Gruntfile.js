module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-htmlhint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-include-js');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bower: {
            install: {
                options: {
                    install: true,
                    copy: true,
                    targetDir: 'saisei_report/libs/',
                    cleanTargetDir: false
                }
            },
            dev_install: {
                options: {
                    install: true,
                    copy: true,
                    targetDir: 'libs/',
                    cleanTargetDir: false
                }
            }
        },
        // include_js: {
        //     default_options: {
        //         files: {
        //             'report_app/index.html': [
        //                 'js/script_one.js',
        //                 'js/script_two.js'
        //             ]
        //         }
        //     }
        // },
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */ \n'
            },
            dist: {
                src: [ 'js/app.js', 'js/controller/*.js', 'js/service/*.js', 'js/factory/*.js'],
                // dest: 'dist/app.js'
                dest: 'saisei_report/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            dev_dist: {
                src: [ 'js/app.js', 'js/controller/*.js', 'js/service/*.js', 'js/factory/*.js'],
                // dest: 'dist/app.js'
                dest: 'js/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        // html 구문검사를 합니다.
        htmlhint: {
            options: {
                force: true
                // htmlhintrc: 'grunt/.htmlhintrc'
            },
            dist: [
                '*.html',
                'templates/*.html'
            ]
        },
        // 자바스크립트 구문검사를 합니다.
        jshint: {
            options: {
                // jshintrc: 'grunt/.jshintrc',
                force: true // error 검출시 task를 fail 시키지 않고 계속 진단
                // reporter: require('jshint-stylish') // output을 수정 할 수 있는 옵션
            },
            all: {
                src: [
                    'Gruntfile.js',
                    'js/*.js',
                    'js/**/*.js'
                ]
            }
        },
        uglify: {
            dist: {
                files: {
                    'saisei_report/js/saisei_report-1.0.0.min.js': [ 'saisei_report/js/<%= pkg.name %>-<%= pkg.version %>.js' ]
                },
                options: {
                    mangle: false,
                    compress: {
                        drop_console: true
                    }
                }
            }
        },
        copy: {
            main: {
                expand: true,
                cwd: './',
                src: ['*.html', 'templates/*.html', 'config/*.json'],
                dest: 'saisei_report/'
                // flatten: true
                // filter: 'isFile'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: [
                    'Gruntfile.js',
                    'js/app.js',
                    'js/*/*.js',
                    '*.html',
                    'templates/*.html'
                ],
                tasks: ['htmlhint','jshint', 'copy', 'concat']
            }
        },
        // 서버를 열어서 브라우져에서 확인합니다.
        connect: {
            server: {
                options: {
                    port: 9010,
                    hostname: 'localhost',
                    livereload: 35729,
                    // keepalive: true,
                    base: './',
                    open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>/saisei_report/'
                }
            }
        }
    });
    grunt.registerTask('serve', function (target) {
        console.log(target);
        if (target === 'dist') {
            return grunt.task.run(['bower', 'copy', 'connect', 'uglify:dist', 'watch' ]);
        }
        grunt.task.run([
            // 'default',
            'connect',
            'copy',
            'watch'
        ]);
    });


    grunt.registerTask('package', ['bower', 'concat', 'copy']);
    grunt.registerTask('default', ['bower', 'connect', 'watch']);
};