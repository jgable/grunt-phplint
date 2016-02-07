/**
 * @file
 * Documentation missing.
 *
 * @todo Log a warning message if the filesSrc is empty.
 */

import * as _ from 'lodash';

import Linter = require('./LintTask');

class ReportOriginalTask {

    public static templates: {
        reportNoResult: _.TemplateExecutor;
        reportSummaryOk: _.TemplateExecutor;
        reportSummaryDetails: _.TemplateExecutor;
    } = {
        reportNoResult: _.template('There is no result to create a report from'),
        reportSummaryOk: _.template('0 error in <%= total %> files'),
        reportSummaryDetails: _.template('<%= errors %> errors with `<%= phpCommand %> FILE_NAME`')
    };

    public static taskName: string = 'phplint-report-original';

    public static taskDescription: string = 'Generate a human readable report from the lint result.';

    public static taskFunction(
        myGrunt: IGrunt,
        task: grunt.task.IMultiTask<any>
    ) : void {
        var options: GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions;
        options = task.options<GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions>({});
        options = _.extend(options, ReportOriginalTask.defaultOptions());

        var reporter: ReportOriginalTask = new ReportOriginalTask(options, task, myGrunt);

        reporter.run();
    }

    public static defaultOptions() : GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions {
        return {
            resultStorage: ['options', Linter.taskName, 'result']
        };
    };

    public options: GruntPhpLint.Grunt.Task.PhpLintReportHuman.IOptions;

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
            this.grunt.log.warn(ReportOriginalTask.templates.reportNoResult().yellow);

            return;
        }

        var summary: GruntPhpLint.KeyValue<number> = {};
        var phpCommand: string;
        var fileNames: string[] = Object
            .keys(result.invalidFiles)
            .sort();

        for (var fileName of fileNames) {
            for (var cacheKeyLight of Object.keys(result.invalidFiles[fileName]).sort()) {
                var cacheEntry: GruntPhpLint.ICacheEntry = result.invalidFiles[fileName][cacheKeyLight];
                phpCommand = [cacheEntry.phpExecutable].concat(cacheEntry.phpCommandArgs).join(' ');

                this.grunt.log.warn(phpCommand.magenta);
                this.grunt.log.warn(cacheEntry.stdOut);
                this.grunt.log.ok('---');

                if (summary.hasOwnProperty(phpCommand) === false) {
                    summary[phpCommand] = 1;
                }
                else {
                    summary[phpCommand]++;
                }
            }
        }

        if (fileNames.length) {
            for (phpCommand of Object.keys(summary)) {
                this.grunt.log.warn(ReportOriginalTask.templates.reportSummaryDetails({
                    errors: summary[phpCommand],
                    phpCommand: phpCommand
                }).red);
            }
        }
        else {
            this.grunt.log.verbose.ok(ReportOriginalTask.templates.reportSummaryOk({
                total: result.numOfLintedFiles
            }).green);
        }
    }

}

export = ReportOriginalTask;
