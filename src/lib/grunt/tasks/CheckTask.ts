/**
 * @file
 * Home of CheckTask.
 */

'use strict';

import * as _ from 'lodash';

import Linter = require('./LintTask');

class CheckTask {

    public static templates: {
        noResult: _.TemplateExecutor;
        errorMessage: _.TemplateExecutor;
    } = {
        noResult: _.template('There is no lint result to check.'),
        errorMessage: _.template('Number of lint errors: <%= numOfErrors %>.')
    };

    public static taskName: string = 'phplint-check';

    public static taskDescription: string = 'Exit with an error code if there is any problem with the linted PHP files.';

    public static taskFunction(
        myGrunt: IGrunt,
        task: grunt.task.IMultiTask<any>
    ) : void {
        var options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions;

        options = _.defaultsDeep(
            {},
            task.options<GruntPhpLint.Grunt.Task.PhpLintLint.IOptions>({}),
            CheckTask.defaultOptions()
        );

        var checker: CheckTask = new CheckTask(options, task, myGrunt);
        checker.run();
    }

    public static defaultOptions() : GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions {
        return {
            resultStorage: ['options', Linter.taskName, 'result']
        };
    };

    public options: GruntPhpLint.Grunt.Task.PhpLintCheck.IOptions;

    public task: grunt.task.IMultiTask<any>;

    public grunt: IGrunt;

    constructor(
        options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions,
        task: grunt.task.IMultiTask<any>,
        myGrunt: IGrunt
    ) {
        this.options = options;
        this.task = task;
        this.grunt = myGrunt;
    };

    public run() : void {
        var result: GruntPhpLint.IResult = this.grunt.config.get<GruntPhpLint.IResult>(this.options.resultStorage.join('.'));
        if (!result) {
            this.grunt.log.warn(CheckTask.templates.noResult().yellow);

            return;
        }

        var numOfErrors: number = Object.keys(result.invalidFiles).length;
        if (numOfErrors) {
            this.grunt.fail.warn(CheckTask.templates.errorMessage({
                numOfErrors: numOfErrors
            }).red);
        }
    };

}

export = CheckTask;
