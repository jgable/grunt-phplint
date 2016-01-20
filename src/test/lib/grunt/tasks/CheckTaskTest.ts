/**
 * @file
 * Mocha tests for CheckTask.
 */

import CheckTask = require('../../../../lib/grunt/tasks/CheckTask');

import chai = require('chai');
var a: Chai.AssertStatic = chai.assert;

describe('lib/grunt/tasks/CheckTask::taskFunction()', function () : void {

    it('should do something', function (done: MochaDone) : void {
        var myGrunt: IGrunt = require('grunt');
        var task: any = {
            options: function () : any { return {}; }
        };

        CheckTask.taskFunction(myGrunt, task);

        done();
    });

});

describe('lib/grunt/tasks/CheckTask::defaultOptions()', function () : void {

    it('should do something', function (done: MochaDone) : void {
        var defaultOptions:  GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions;
        defaultOptions = CheckTask.defaultOptions();

        a.deepEqual(
            defaultOptions.resultStorage,
            ['options', 'phplint-lint', 'result']
        );

        done();
    });

});
