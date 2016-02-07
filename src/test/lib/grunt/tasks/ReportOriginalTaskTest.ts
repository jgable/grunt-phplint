/**
 * @file
 * Mocha tests for ReportOriginalTask.
 */

import ReportOriginalTask = require('../../../../lib/grunt/tasks/ReportOriginalTask');

import chai = require('chai');
var a: Chai.AssertStatic = chai.assert;

describe('lib/grunt/tasks/ReportOriginalTask::taskFunction()', function () : void {

    /**
     * @todo Convert this test to BDD because here is no assert.
     */
    it('should do something', function (done: MochaDone) : void {
        var myGrunt: IGrunt = require('grunt');
        var task: any = {
            options: function () : any { return {}; }
        };

        var result: GruntPhpLint.IResult = {
            numOfLintedFiles: 1,
            invalidFiles: {
                'foo.php': {
                    '5615.0-0': {
                        phpExecutable: 'php',
                        phpCommandArgs: ['-l'],
                        exitCode: 0,
                        stdOut: [
                            "Parse error: syntax error, unexpected ':', expecting '{' in foo.php on line 21",
                            'Errors parsing foo.php'
                        ].join('\n'),
                        stdError: ''
                    }
                }
            }
        };

        myGrunt.config.set('options.phplint-lint.result', result);
        ReportOriginalTask.taskFunction(myGrunt, task);
        myGrunt.config.set('options.phplint-lint.result', null);

        done();
    });

});

describe('lib/grunt/tasks/ReportOriginalTask::defaultOptions()', function () : void {

    it('should do something', function (done: MochaDone) : void {
        var defaultOptions:  GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions;
        defaultOptions = ReportOriginalTask.defaultOptions();

        a.deepEqual(
            defaultOptions.resultStorage,
            ['options', 'phplint-lint', 'result']
        );

        done();
    });

});
