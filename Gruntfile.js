
module.exports = function(grunt) {
	var cfg = {
		jshint: {
			options: {
				boss: true,
				node: true
			},

			all: ["tasks/**/*.js", "test/**/*.js", "Gruntfile.js"]
		},

		simplemocha: {
			options: {
				reporter: "spec",
				ui: "bdd",
				compilers: "coffee:coffee-script"
			},

			all: ["test/*_spec.js"]
		}
	};

	grunt.initConfig(cfg);

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-simple-mocha");

	grunt.registerTask("default", ["jshint:all", "simplemocha:all"]);
};