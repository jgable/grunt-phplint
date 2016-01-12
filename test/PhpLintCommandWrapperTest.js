
var assert = require('assert');

describe('PhpLintCommandWrapper', function() {
	var PhpLintCommandWrapper = require('../tasks/core/PhpLintCommandWrapper');
	var wrapper = null;

	beforeEach(function(done) {
		wrapper = new PhpLintCommandWrapper({});

		done();
	});

	describe('_parseOptions()', function () {
		it('should return', function (done) {
			var options;

			assert.equal('', wrapper._parseOptions({}).join(' '));

			options = {
				'-n': false
			};
			assert.equal('', wrapper._parseOptions(options).join(' '));

			options = {
				'-n': null
			};
			assert.equal('-n', wrapper._parseOptions(options).join(' '));

			options = {
				'-n': null,
				'-c': false
			};
			assert.equal('-n', wrapper._parseOptions(options).join(' '));

			options = {
				'-n': null,
				'-c': 'foo'
			};
			assert.equal('-n -c foo', wrapper._parseOptions(options).join(' '));

			options = {
				'-n': null,
				'-d': [
					'a=b',
					'c=d'
				]
			};
			assert.equal('-n -d a=b -d c=d', wrapper._parseOptions(options).join(' '));

			done();
		});
	});

});
