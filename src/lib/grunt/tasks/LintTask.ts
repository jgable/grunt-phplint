import KeyValue = GruntPhpLint.KeyValue;
/**
 * @file
 * Home of Lint.
 */

'use strict';

import * as OS from 'os';
import * as Path from 'path';
import * as Crypto from 'crypto';
import * as ChildProcess from 'child_process';
import * as Async from 'async';
import * as _ from 'lodash';

import ExitCode = require('../../ExitCode');

class LintTask {

    public static taskName: string = 'phplint-lint';

    public static taskDescription: string = 'Run PHP lint on your php files';

    public static taskFunction(
        myGrunt: IGrunt,
        task: grunt.task.IMultiTask<any>
    ) : void {
        var childProcess: typeof ChildProcess = require('child_process');
        var options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions;

        options = _.defaultsDeep(
            {},
            task.options<GruntPhpLint.Grunt.Task.PhpLintLint.IOptions>({}),
            LintTask.defaultOptions(task)
        );

        if (options.cache === null) {
            options.cache = {
                engine: null
            };
        }

        LintTask.processTaskArgs(myGrunt, options, task.args);

        if (!options.php) {
            options.php = {
                'custom': {
                    executable: 'php'
                }
            };
        }

        for (var phpVariantName of Object.keys(options.php)) {
            _.defaultsDeep(
                options.php[phpVariantName],
                {
                    enabled: true,
                    executable: 'php',
                    args: {
                        config: null,
                        define: {}
                    }
                }
            );
        }

        var linter: LintTask = new LintTask(
            options,
            task,
            myGrunt,
            childProcess
        );

        linter.run();
    }

    /**
     * Filter key-value pairs based on the value.
     *
     * @return Keys from items object.
     */
    public static filterEnabled(items: KeyValue<boolean | Object>, property?: string) : string[] {
        var enabledItems: string[] = [];

        if (typeof property === 'undefined' || property === null) {
            property = 'enabled';
        }

        for (var key in items) {
            /* istanbul ignore else */
            if (items.hasOwnProperty(key)) {
                if (
                    items[key] === true
                    || (
                        typeof items[key] === 'object'
                        && items[key].hasOwnProperty(property)
                        && items[key][property] === true
                    )
                ) {
                    enabledItems.push(key);
                }
            }
        }

        return enabledItems;
    }

    public static defaultOptions(
        task: grunt.task.IMultiTask<any>
    ) : GruntPhpLint.Grunt.Task.PhpLintLint.IOptions {
        return {
            resultStorage: ['options', task.name, 'result'],
            spawnLimit: OS.cpus().length,
            cache: {
                engine: 'file',
                ttl: 36000,
                prefix: null,
                delimiter: ':'
            },
            cacheClear: false
        };
    };

    public static processTaskArgs(
        g: IGrunt,
        options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions,
        args: string[]
    ) : void {
        var matches: RegExpMatchArray;
        for (var arg of args) {
            if (arg === 'no-cache') {
                options.cache.engine = null;

                continue;
            }

            if (arg === 'cache-clear') {
                options.cacheClear = true;

                continue;
            }

            matches = arg.match(/^(sl|ttl)-(\d+)$/);
            if (matches && matches.length) {
                if (matches[1] === 'sl') {
                    options.spawnLimit = +matches[2];
                }
                else if (matches[1] === 'ttl') {
                    options.cache.ttl = +matches[2];
                }

                continue;
            }

            g.log.verbose.warn('Unknown task argument: "' + arg + '"');
        }
    }

    public static buildPhpCommandArgs(
        phpCliArgs: GruntPhpLint.IPhpCliArgs
    ) : string[] {
        var args: string[] = [];

        if (phpCliArgs.hasOwnProperty('config') && phpCliArgs.config) {
            args.push('-c');
            args.push(phpCliArgs.config);
        }

        if (phpCliArgs.hasOwnProperty('define') && phpCliArgs.define) {
            for (var value of LintTask.filterEnabled(phpCliArgs.define)) {
                args.push('-d');
                args.push(value);
            }
        }

        return args;
    }

    public static buildPhpCommandArgsForLint(
        iniOptionValues: GruntPhpLint.KeyValue<any>
    ) : string[] {
        var args: string[] = ['-n'];
        var value: string;
        for (var optionName of Object.keys(iniOptionValues)) {
            if (typeof iniOptionValues[optionName] === 'boolean') {
                value = (iniOptionValues[optionName] ? '1' : '0');
            }
            else {
                value = iniOptionValues[optionName].toString();
            }
            args.push('-d');
            args.push(optionName + '=' + value);
        }

        args.push('-l');

        return args;
    }

    public static getSyntaxModifierCacheKey(
        syntaxModifierOptionValues: GruntPhpLint.KeyValue<string | number | boolean>
    ) : string {
        var cacheKey: string[] = [];
        for (var optionName of Object.keys(syntaxModifierOptionValues)) {
            switch (typeof syntaxModifierOptionValues[optionName]) {
                case 'boolean':
                    cacheKey.push((syntaxModifierOptionValues[optionName] ? '1' : '0'));
                    break;

                default:
                    cacheKey.push(syntaxModifierOptionValues[optionName].toString());
                    break;

            }
        }

        return cacheKey.length ? cacheKey.join('-') : '-';
    };

    public static getPhpVersionCacheKey(
        phpVersion: string
    ) : string {
        var fragments: RegExpExecArray = /^(\d+)\.(\d+)(\.|$)/.exec(phpVersion);

        return fragments[1] + '.' + fragments[2];
    };

    public options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions;

    public task: grunt.task.IMultiTask<any>;

    public grunt: IGrunt;

    public childProcess: typeof ChildProcess;

    public async: typeof Async;

    public path: typeof Path;

    public crypto: typeof Crypto;

    public taskDoneCallback: grunt.task.AsyncResultCatcher;

    public result: GruntPhpLint.IResult = null;

    public cache: Cacheman.Cacheman = null;

    /**
     * Key is the PHP version. eg.: "5" or "5.6"
     * Value is a key-value pair of INI option name and type.
     */
    protected syntaxModifierIniOptions: GruntPhpLint.KeyValue<GruntPhpLint.KeyValue<string>> = {
        '4': {
            'short_open_tag': 'boolean',
            'asp_tags': 'boolean'
        },
        '5': {
            'short_open_tag': 'boolean',
            'asp_tags': 'boolean'
        }
    };

    protected phpMetaBag: GruntPhpLint.KeyValue<GruntPhpLint.IPhpMeta>;

    /**
     * @todo Put the dependencies into a {key: value}.
     */
    constructor(
      options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions,
      task: grunt.task.IMultiTask<any>,
      myGrunt: IGrunt,
      childProcess?: typeof ChildProcess
    ) {
        this.options = options;
        this.task = task;
        this.grunt = myGrunt;

        this.childProcess = (typeof childProcess !== 'undefined' ? childProcess : ChildProcess);
        this.async = Async;
        this.path = Path;
        this.crypto = Crypto;
    };

    public run() : void {
        this.taskDoneCallback = this.task.async();

        this.runInitPhpMetaBag();
        this.runInitCache();
        if (this.options.cacheClear) {
            this.cacheClear();

            return;
        }

        this.runInitResult();
        // @todo Handle overlaps. Same file linted twice or more in different targets.
        this.result.numOfLintedFiles += this.task.filesSrc.length;

        this.async.eachLimit<string>(
            this.task.filesSrc,
            this.options.spawnLimit,
            this.lint.bind(this),
            this.asyncEachDoneCallback.bind(this)
        );
    };

    protected runInitPhpMetaBag() : void {
        this.phpMetaBag = {};

        var php: GruntPhpLint.IPhpVariant;
        var phpVersion: string;
        var syntaxModifierOptionValues: GruntPhpLint.KeyValue<string | number | boolean>;

        for (var phpName of Object.keys(this.options.php)) {
            php = this.options.php[phpName];
            phpVersion = this.getPhpVersion(php);
            syntaxModifierOptionValues = this.getSyntaxModifierValues(php, phpVersion);

            this.phpMetaBag[phpName] = {
                version: phpVersion,
                commandArgs: LintTask.buildPhpCommandArgsForLint(syntaxModifierOptionValues),
                cacheKeyItems: [
                    LintTask.getPhpVersionCacheKey(phpVersion),
                    LintTask.getSyntaxModifierCacheKey(syntaxModifierOptionValues)
                ]
            };
        }
    };

    protected runInitResult() : void {
        this.result = this.grunt.config.get<GruntPhpLint.IResult>(this.options.resultStorage.join('.'));
        if (typeof this.result === 'undefined' || this.result === null) {
            this.result = {
                numOfLintedFiles: 0,
                invalidFiles: {}
            };

            this.grunt.config.set<GruntPhpLint.IResult>(this.options.resultStorage.join('.'), this.result);
        }
    };

    protected runInitCache() : void {
        if (this.options.cache.engine) {
            var CM: Cacheman.Cacheman = require('cacheman');

            var cacheKeyPrefixes: string[] = [];
            var cacheName: string = null;
            var taskName: string = 'lint';

            switch (this.options.cache.engine) {
                case 'file':
                    // @todo Find a better way for type cast.
                    var fileCache: CachemanFile.IOptions = <CachemanFile.IOptions>this.options.cache;

                    if (!fileCache.hasOwnProperty('tmpDir') || !fileCache.tmpDir) {
                        fileCache.tmpDir = this.path.join(OS.tmpdir(), 'grunt-phplint');
                    }

                    if (!this.grunt.file.exists(fileCache.tmpDir)) {
                        this.grunt.file.mkdir(fileCache.tmpDir);
                    }
                    break;

                default:
                    cacheKeyPrefixes.push((this.options.cache.prefix || 'grunt-phplint'));
                    cacheKeyPrefixes.push(taskName);

                    cacheName = cacheKeyPrefixes.pop();

                    this.options.cache.prefix = cacheKeyPrefixes.join(this.options.cache.delimiter);
                    break;

            }

            this.cache = new CM(cacheName, this.options.cache);
        }
        else {
            this.cache = null;
        }
    };

    protected cacheClear() : void {
        if (this.cache) {
            this.cache.clear(this.taskDoneCallback);
        }
    };

    /**
     * Lint a file with all the configured PHP versions.
     *
     * @param filePath
     *   File to lint.
     * @param asyncEachItemCallback
     *   A function to call when the filePath was linted with all PHP version.
     */
    protected lint(
      filePath: string,
      asyncEachItemCallback: (error: Error) => void
    ) : void {
        var fileHash: string = null;

        if (this.cache) {
            var sha1: Crypto.Hash = this.crypto.createHash('sha1');
            var fileContent: string = this.grunt.file.read(filePath);
            fileHash = sha1.update(fileContent).digest('hex');
        }

        var phpNames: string[] = Object.keys(this.options.php);
        var self: LintTask = this;

        var processedPhpNames: number = 0;
        var callback: (error: Error) => void = function (error: Error) : void {
            processedPhpNames++;
            if (error || processedPhpNames === phpNames.length) {
                asyncEachItemCallback(error);
            }
        };

        for (var phpName of phpNames) {
            self.lintCacheOrExec(filePath, fileHash, phpName, self.options.php[phpName], callback);
        }
    };

    protected lintCacheOrExec(
        filePath: string,
        fileHash: string,
        phpName: string,
        php: GruntPhpLint.IPhpVariant,
        asyncEachItemPhpNameCallback: (error: Error) => void
    ) : void {
        var self: LintTask = this;
        var phpMeta: GruntPhpLint.IPhpMeta = self.phpMetaBag[phpName];

        if (this.cache) {
            var cacheKeyItems: string[] = phpMeta.cacheKeyItems.concat([fileHash]);

            this.cache.get(
                cacheKeyItems.join(this.options.cache.delimiter),
                (function (
                    innerCacheKeyItems: string[],
                    innerPhp: GruntPhpLint.IPhpVariant,
                    innerPhpCommandArgs: string[]
                ): (error: Error, data: GruntPhpLint.ICacheEntry) => void {
                    return function (error: Error, data: GruntPhpLint.ICacheEntry) : void {
                        if (error !== null) {
                            asyncEachItemPhpNameCallback(error);

                            return;
                        }

                        if (data) {
                            if (data.exitCode) {
                                var cacheKeyLight: string;
                                cacheKeyLight = innerCacheKeyItems[0] + self.options.cache.delimiter + innerCacheKeyItems[1];

                                data.stdOut = data.stdOut.split('{{ filePath }}').join(filePath);
                                data.stdError = data.stdError.split('{{ filePath }}').join(filePath);
                                if (self.result.invalidFiles.hasOwnProperty(filePath) === false) {
                                    self.result.invalidFiles[filePath] = {};
                                }
                                self.result.invalidFiles[filePath][cacheKeyLight] = data;
                            }

                            asyncEachItemPhpNameCallback(null);
                        }
                        else {
                            self.lintExec(
                                filePath,
                                innerCacheKeyItems,
                                innerPhp.executable,
                                innerPhpCommandArgs,
                                asyncEachItemPhpNameCallback
                            );
                        }
                    };
                })(cacheKeyItems, php, phpMeta.commandArgs)
            );
        }
        else {
            this.lintExec(
                filePath,
                phpMeta.cacheKeyItems,
                php.executable,
                phpMeta.commandArgs,
                asyncEachItemPhpNameCallback
            );
        }
    };

    protected lintExec(
      filePath: string,
      cacheKeyItems: string[],
      phpExecutable: string,
      phpCommandArgs: string[],
      asyncEachItemPhpNameCallback: (error: Error) => void
    ) : void {
        var args: string[] = phpCommandArgs.concat([filePath]);

        var context: GruntPhpLint.IRegisterLintResultContext<LintTask> = {
            self: this,
            filePath: filePath,
            phpExecutable: phpExecutable,
            phpCommandArgs: phpCommandArgs,
            cacheKeyItems: cacheKeyItems,
            cb: asyncEachItemPhpNameCallback
        };

        this.childProcess.execFile(
            phpExecutable,
            args,
            {},
            this.lintExecResultHandler.bind(context)
        );
    };

    protected lintExecResultHandler(
        error: GruntPhpLint.IChildProcessExecError,
        stdOut: Buffer,
        stdError: Buffer
    ) : void {
        var context: GruntPhpLint.IRegisterLintResultContext<LintTask> = <any>this;
        if (error !== null && error.code !== ExitCode.SyntaxError) {
            context.cb(error);

            return;
        }

        var cacheEnabled: boolean = (context.self.cache !== null && context.cacheKeyItems.length > 0);

        if (error) {
            if (context.self.result.invalidFiles.hasOwnProperty(context.filePath) === false) {
                context.self.result.invalidFiles[context.filePath] = {};
            }

            var cacheKeyLight: string = context.cacheKeyItems[0] + context.self.options.cache.delimiter + context.cacheKeyItems[1];

            context.self.result.invalidFiles[context.filePath][cacheKeyLight] = {
                phpExecutable: context.phpExecutable,
                phpCommandArgs: context.phpCommandArgs,
                exitCode: error.code,
                stdOut: stdOut.toString(),
                stdError: stdError.toString()
            };
        }

        if (cacheEnabled) {
            context.self.cache.set<GruntPhpLint.ICacheEntry>(
                context.cacheKeyItems.join(context.self.options.cache.delimiter),
                {
                    phpExecutable: context.phpExecutable,
                    phpCommandArgs: context.phpCommandArgs,
                    exitCode: (error ? error.code : 0),
                    stdOut: stdOut.toString().split(context.filePath).join('{{ filePath }}'),
                    stdError: stdError.toString().split(context.filePath).join('{{ filePath }}')
                },
                context.self.options.cache.ttl
            );
        }

        context.cb(null);
    }

    protected asyncEachDoneCallback(error?: Error) : void {
        if (error !== null) {
            this.grunt.fail.warn(error);
        }

        this.taskDoneCallback(error);
    };

    /**
     * @param phpVersion
     *   PHP version string. Only the major and minor numbers are used.
     *
     * @return
     *   Key is a PHP INI option name, value is a type identifier as string.
     *   Eg.: {short_open_tag: "boolean", asp_tags: "boolean"}
     */
    protected getSyntaxModifierIniOptions(phpVersion: string) : GruntPhpLint.KeyValue<string> {
        var fragments: RegExpExecArray = /^(\d+)\.(\d+)(\.|$)/.exec(phpVersion);
        if (fragments === null) {
            return null;
        }

        var version: string;

        version = fragments[1] + '.' + fragments[2];
        if (this.syntaxModifierIniOptions.hasOwnProperty(version)) {
            return this.syntaxModifierIniOptions[version];
        }

        version = fragments[1];
        if (this.syntaxModifierIniOptions.hasOwnProperty(version)) {
            return this.syntaxModifierIniOptions[version];
        }

        return null;
    }

    protected getPhpVersion(php: GruntPhpLint.IPhpVariant) : string {
        // The `php -v` gives a long output.
        // This one outputs only the version string, further parsing isn't
        // necessary.
        // @todo I don't know which one is faster.
        return <string>(this.childProcess.execFileSync(
            php.executable,
            [
                '-n',
                '-r',
                'echo PHP_VERSION;'
            ],
            {
                encoding: 'utf8'
            }
        ));
    }

    protected getSyntaxModifierValues(
        php: GruntPhpLint.IPhpVariant,
        phpVersion: string
    ) : GruntPhpLint.KeyValue<string | number | boolean> {
        var syntaxModifierIniOptions: GruntPhpLint.KeyValue<string> = this.getSyntaxModifierIniOptions(phpVersion);
        if (!syntaxModifierIniOptions) {
            return {};
        }

        var args: string[] = LintTask.buildPhpCommandArgs(php.args);
        var phpCodeToRun: string = '$export = array(';
        for (var optionName of Object.keys(syntaxModifierIniOptions)) {
            phpCodeToRun += "'" + optionName + "' => (" + syntaxModifierIniOptions[optionName] + ") ini_get('" + optionName + "'),";
        }
        phpCodeToRun += '); echo json_encode($export);';

        args.push('-r');
        args.push(phpCodeToRun);
        var json: string = <string>(this.childProcess.execFileSync(
            php.executable,
            args,
            {
                encoding: 'utf8'
            }
        ));

        return JSON.parse(json);
    };

}

export = LintTask;
