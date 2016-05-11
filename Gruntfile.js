var exec = require( 'child_process' ).exec;

module.exports = function( grunt ){

	grunt.initConfig({

		pkg: grunt.file.readJSON( 'package.json' ),

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today( "yyyy-mm-dd" ) %> */\n'
			}
		},

		clean: {
			dist: [ 'dist' ]
		},

		copy: {

			main: {
				files: [
					{
						expand: true,
						src: [ 'server.js', 'package.json', 'npm-shrinkwrap.json' ],
						dest: 'dist/'
					},{
						expand: true,
						src: [ 'run/**/*', '!**/*.{log,pid}' ],
						dest: 'dist/'
					}
				]
			},

			webapp: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: [ 'webapp/**/*', '!**/*.jshintrc' ],
						dest: 'dist/'
					}
				]
			},

			pub: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: [ 'public/**/*', '!*/{css,js}/**', '!**/*.jshintrc', '!**/*.map' ],
						dest: 'dist/'
					}
				]
			},

			config: {
				files: [
					{
						expand: true,
						cwd: 'src/',
						src: [ 'config/config.json' ],
						dest: 'dist/'
					}
				]
			}
		},

		useminPrepare: {
			html: 'dist/webapp/views/layout.html'
		},

		usemin: {
			html: 'dist/webapp/views/**/*.html',
			js: 'dist/public/**/*.js',
			css: 'dist/public/**/*.css',
			options: {
				assetsDirs: [ 'dist', 'dist/public' ],
				patterns: {
					js: [
						[ /(img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images' ]
					]
				}
			}
		},

		filerev: {
			options: {
				algorithm: 'md5',
				length: 8
			},
			pub: {
				src: [ 'dist/public/**/*' ]
			}
		},

		extend: {
			options: {
				deep: true,
				defaults: require( './src/config/files/default.json' )
			},
			production: {
				files: {
					'src/config/config.json': [ 'src/config/files/production.json' ]
				}
			}
		}
	});

	require( 'load-grunt-tasks' )( grunt );

	grunt.registerTask( 'config', 'Create a config file for the app', function( env ){

		var isDev = ( !env || env === 'dev' );
		var done;

		if( isDev ){

			done = this.async();

			exec( 'whoami', function( err, stdout /*, stderr */ ){

				var username = stdout.trim();

				grunt.log.writeln( 'Adding ' + username + '.json to config for extend' );

				grunt.config.merge( {
					extend: {
						development: {
							files: {
								'src/config/config.json': [ 'src/config/files/development.json', 'src/config/files/user/'+ username +'.json' ]
							}
						}
					}
				});

				grunt.task.run( 'extend:development' );

				done();
			} );

		} else {

			grunt.task.run( 'extend:' + env );
		}

	} );

	grunt.registerTask( 'allConfigs', 'Create separate config files for each env so they can be renamed when deployed', function(){

		var envs = [
			'production'
		];

		envs.forEach( function( env ){

			var extend = {};
			var taskName = 'file-' + env;

			extend[ taskName ] = { files: {} };
			extend[ taskName ].files[ 'src/config/env/' + env + '.json' ] = [ 'src/config/files/' + env + '.json' ];

			grunt.config.merge( { extend: extend } );
			grunt.task.run( 'extend:' + taskName );
		} );
	} );

	grunt.registerTask( 'dist', [ 'default:dev' ] );

	grunt.registerTask( 'default', 'Default prod build with optional config', function( configName ){

		grunt.task.run([
			'clean',
			'config:' + ( configName || 'production' ),
			'allConfigs',
			'copy',
			'useminPrepare',
			'concat:generated',
			'cssmin:generated',
			'uglify:generated',
			'filerev',
			'usemin'
		]);
	} );
};