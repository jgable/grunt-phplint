
module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		phplint: {
			good: ["test/rsrc/*-good.php"],
			good_nocache: {
				options: {
					cache: false
				},
				files: {
					src: ["test/rsrc/*-good.php"]
				}
			},
			bad: ["test/rsrc/*-fail.php"],

			explicit: {
				options: {
					phpCmd: "/usr/bin/php"
				},

				src: ["test/rsrc/*-good.php"]
			}
		}
	});

	grunt.loadTasks("./tasks");
	grunt.registerTask("default", ["phplint:good", "phplint:good_nocache"]);
};
