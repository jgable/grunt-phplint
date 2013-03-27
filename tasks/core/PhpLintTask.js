var grunt = require("grunt"),
	_ = grunt.util._,
	async = grunt.util.async;

var PhpLintCommandWrapper = require("./PhpLintCommandWrapper");

function PhpLintTask(task) {
	this.options = task.options();
	this.files = task.filesSrc;
	this.async = task.async;
}

PhpLintTask.prototype = {

	run: function() {
		var self = this,
			done = this.async();

		var lintFile = function(filePath, cb) {
			var linter = new PhpLintCommandWrapper(self.options);

			linter.lintFile(filePath, function(err, output) {
				// Get rid of trailing \n
				if(output.slice(-1) === "\n") { 
					output = output.slice(0, -1);
				}

				grunt.verbose.write(filePath.cyan + ": " + output + "...");
				if(err) {
					if (output === "") {
						output = err.message;
					}
					
					grunt.verbose.error();
					grunt.fail.warn(output);
				}

				grunt.verbose.ok();
				cb();
			});
		};

		async.forEach(this.files, lintFile, function(err) {
			if(err) {
				return grunt.fail.warn(err);
			}

			grunt.log.ok(self.files.length + " files php linted.");

			done();
		});
	}
};

module.exports = PhpLintTask;