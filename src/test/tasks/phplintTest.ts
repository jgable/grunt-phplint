/**
 * @file
 * Mocha tests for phplint-lint.
 */

import * as childProcess from 'child_process';
import * as path from 'path';
import * as rmdir from 'rmdir';
import * as fs from 'fs';
import * as _ from 'lodash';
import * as os from 'os';

import chai = require('chai');
import env = require('../env');

(function (assert: Chai.AssertStatic) : void {

    type BddCase = {

        msg: string;

        gruntFile?: string;

        /**
         * phplint-lint:foo
         */
        targets: string[];

        /**
         * For example: "-verbose"
         */
        args?: string[];

        expected?: {

            exitCode?: number;

            stdout?: string;

            stderr?: string;

        };

    };

    type SpawnResult = {
        pid: number;
        output: string[];
        stdout: string | Buffer;
        stderr: string | Buffer;
        status: number;
        signal: string;
        error: GruntPhpLint.IChildProcessExecError;
    };

    type ICacheEntryWrapper = {

        value: string;

        expire: number;

    };

    /**
     * Duplicates grunt.fail.ErrorCode.
     */
    enum ErrorCode {
        NoError = 0,
        Fatal = 1,
        MissingGruntfile = 2,
        Task = 3,
        Template = 4,
        Autocomplete = 5,
        Warning = 6,
    }

    var defaultTmpDir: string = path.join(os.tmpdir(), 'grunt-phplint');
    var reportsDirParts: string = './reports/coverage-parts';
    var istanbul: string = './node_modules/.bin/istanbul';
    var coverageReportIndex: number = 0;
    var redisCliArgs: string[] = [
        '-h', env.redisHost,
        '-p', env.redisPort.toString(),
        '-n', env.redisDatabase.toString()
    ];

    function runGrunt(
        gruntFile: string,
        targets: string[],
        args?: string[],
        expectedExitCode?: number
    ) : SpawnResult {
        if (typeof args === 'undefined') {
            args = [];
        }

        coverageReportIndex++;
        var runId: string = _.padStart(coverageReportIndex.toString(), 2, '0');

        var result: SpawnResult = childProcess.spawnSync(
            istanbul,
            [
                'cover',
                '--dir', path.join(reportsDirParts, runId),
                '--report', 'lcovonly',
                'grunt',
                '--',
                '--no-color',
                '--gruntfile', gruntFile
            ].concat(targets).concat(args),
            {
                env: process.env
            }
        );

        if (typeof expectedExitCode !== 'undefined') {
            assert.equal(
                expectedExitCode,
                (typeof result.status !== 'undefined' ? result.status : ErrorCode.NoError),
                'Exit code match: ' + runId
            );
        }

        return result;
    }

    function cacheClearFile(
        dir: string,
        done: MochaDone
    ) : void {
        fs.exists(dir, function (exists: boolean) : void {
            if (exists) {
                rmdir(dir, done);
            }
            else {
                done();
            }
        });
    }

    describe('tasks', function () : void {
        it('should register 3 Grunt tasks', function (done: Function) : void {
            var g: IGrunt = require('grunt');
            var knownTasks: string[] = ['lint', 'report-original', 'check'];
            var e: any;
            var tasks: any;

            for (var taskNameSuffix of knownTasks) {
                e = require('../../tasks/phplint-' + taskNameSuffix);
                assert.ok(e);
                e(g);
            }

            tasks = (<any> g.task)._tasks;
            assert.ok(tasks);

            for (taskNameSuffix of knownTasks) {
                assert.ok(tasks.hasOwnProperty('phplint-' + taskNameSuffix));
            }
            assert.equal(Object.keys(tasks).length , knownTasks.length, 'Only the known tasks are registered.');

            done();
        });
    });

    describe('BDD - exit codes', function () : void {
        var cases: GruntPhpLint.KeyValue<BddCase> = {
            'cache-none-exit-true': {
                msg: 'lint+check cache-none-exit-true',
                targets: [
                    'phplint-lint:cache-none-exit-true',
                    'phplint-check:subjects'
                ]
            },
            'cache-none-exit-false': {
                msg: 'lint+check cache-none-exit-false',
                targets: [
                    'phplint-lint:cache-none-exit-false',
                    'phplint-check:subjects'
                ],
                expected: {
                    exitCode: ErrorCode.Warning
                }
            }
        };

        for (var caseId of Object.keys(cases)) {
            it(cases[caseId].msg, (function (cId: string, c: BddCase) : {(done: MochaDone) : void} {
                _.defaultsDeep(c, {
                    gruntFile: 'Gruntfile.test.js',
                    args: [],
                    expected: {
                        exitCode: ErrorCode.NoError,
                        stdout: path.join('fixtures', 'outputs', cId + '.stdout.txt'),
                        stderr: null
                    }
                });

                return function (done: MochaDone) : void {
                    var result: SpawnResult = runGrunt(c.gruntFile, c.targets, c.args, c.expected.exitCode);

                    for (var streamName of ['stdout', 'stderr']) {
                        if (c.expected[streamName] === false) {
                            continue;
                        }

                        assert.equal(
                            (c.expected[streamName] === null ? '' : fs.readFileSync(c.expected[streamName], {encoding: 'utf-8'})),
                            result[streamName].toString('utf-8'),
                            'Output of ' + streamName + ' different than the expected.'
                        );
                    }

                    done();
                };
            })(caseId, cases[caseId]));
        }
    });

    describe('BDD - cache-clear', function () : void {

        before('Ensure that the cache directory is empty', function (done: MochaDone) : void {
            cacheClearFile(defaultTmpDir, done);
        });

        it('should clear the cache', function (done: MochaDone) : void {
            var targets: string[] = ['phplint-lint:cache-file-exit-false'];

            runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            assert.equal(5, fs.readdirSync(defaultTmpDir).length, 'Cache is built up');

            targets[0] += ':cache-clear';
            runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            assert.equal(0, fs.readdirSync(defaultTmpDir).length, 'Cache is empty');

            done();
        });
    });

    describe('BDD - cache-get - no-cache', function () : void {

        before('Ensure that the cache directory is empty', function (done: MochaDone) : void {
            cacheClearFile(defaultTmpDir, done);
        });

        it('should use the cache', function (done: MochaDone) : void {
            var result: SpawnResult;
            var dirContent: string[];
            var targets: string[] = [
                'phplint-lint:cache-file-exit-false',
                'phplint-report-original:subjects'
            ];

            var position: number;
            var expectedOutput: string;

            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);

            dirContent = fs.readdirSync(defaultTmpDir);
            assert.equal(5, dirContent.length, 'Cache is built up');

            expectedOutput = 'Errors parsing fixtures/subjects/le-70-sot0-0.php';
            position = (<Buffer> result.stdout).toString('utf-8').indexOf(expectedOutput);
            assert.ok(position !== -1);

            // Modify the cached result to make them different than the original
            // ones.
            var cacheEntryWrapper: ICacheEntryWrapper;
            var cacheValue: GruntPhpLint.ICacheEntry;
            var waterMark: string = Date.now().toString() + '\n';
            for (var fileName of dirContent) {
                cacheEntryWrapper = require(path.join(defaultTmpDir, fileName));
                cacheValue = JSON.parse(cacheEntryWrapper.value);
                cacheValue.stdOut = waterMark + cacheValue.stdOut;
                cacheEntryWrapper.value = JSON.stringify(cacheValue);
                fs.writeFileSync(path.join(defaultTmpDir, fileName), JSON.stringify(cacheEntryWrapper, null, 2));
            }

            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            position = (<Buffer> result.stdout).toString('utf-8').indexOf(waterMark);
            assert.ok(position !== -1);

            targets[0] += ':no-cache';
            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            position = (<Buffer> result.stdout).toString('utf-8').indexOf(waterMark);
            assert.ok(position === -1);

            done();
        });

    });

    describe('BDD - Report Original - No result', function () : void {
        it('should show a "there is no result" message', function (done: MochaDone) : void {
            var targets: string[] = ['phplint-report-original:subjects'];
            var result: SpawnResult;

            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            assert.equal(
                fs.readFileSync('fixtures/outputs/reports-original.no-result.stdout.txt', {encoding: 'utf-8'}),
                (<Buffer> result.stdout).toString('utf-8')
            );

            done();
        });
    });

    describe('BDD - Report Original - Empty result - log level verbose', function () : void {
        it('should show a "empty result" message', function (done: MochaDone) : void {
            var targets: string[] = [
                'phplint-lint:empty:no-cache',
                'phplint-report-original:subjects'
            ];
            var result: SpawnResult;

            result = runGrunt('Gruntfile.test.js', targets, ['-verbose'], ErrorCode.NoError);
            var expectedOutput: string = fs.readFileSync(
                'fixtures/outputs/reports-original.empty-result.ll-verbose.stdout.txt',
                {encoding: 'utf-8'}
            );
            var position: number = (<Buffer> result.stdout).toString('utf-8').indexOf(expectedOutput);

            assert.ok(position !== -1);

            done();
        });
    });

    describe('BDD - Report Original - Empty result - log level normal', function () : void {
        it('should show a "empty result" message', function (done: MochaDone) : void {
            var targets: string[] = [
                'phplint-lint:empty:no-cache',
                'phplint-report-original:subjects'
            ];
            var result: SpawnResult;

            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            assert.equal(
                fs.readFileSync('fixtures/outputs/reports-original.empty-result.ll-normal.stdout.txt', {encoding: 'utf-8'}),
                (<Buffer> result.stdout).toString('utf-8')
            );

            done();
        });
    });

    describe('BDD - cache-redis', function () : void {
        it('should uses Redis as cache backend', function (done: MochaDone) : void {
            var result: SpawnResult;

            runGrunt('Gruntfile.test.js', ['phplint-lint:cache-redis:cache-clear'], [], ErrorCode.NoError);
            result = childProcess.spawnSync(
                'redis-cli',
                redisCliArgs.concat(['--scan'])
            );
            assert.equal(
                0,
                (typeof result.status !== 'undefined' ? result.status : ErrorCode.NoError),
                'Exit code match: redis-cli empty list'
            );
            assert.equal('', (<Buffer> result.stdout).toString('utf-8'));

            runGrunt('Gruntfile.test.js', ['phplint-lint:cache-redis'], [], ErrorCode.NoError);
            result = childProcess.spawnSync(
                'redis-cli',
                redisCliArgs.concat(['--scan'])
            );
            assert.equal(
                0,
                (typeof result.status !== 'undefined' ? result.status : ErrorCode.NoError),
                'Exit code match: redis-cli list items'
            );
            var cacheKeys: string[] = (<Buffer> result.stdout).toString('utf-8').split('\n');
            assert.equal(5, cacheKeys.length);
            assert.ok(
                cacheKeys[0].match(/^grunt-phplint:lint:\d\.\d:(([01]-[01])|-):[a-z0-9A-Z]{40}$/),
                'Format of the cache key'
            );

            done();
        });
    });

    describe('BDD - cache-file-multi-php', function () : void {
        before('Ensure that the cache directory is empty', function (done: MochaDone) : void {
            cacheClearFile(defaultTmpDir, done);
        });

        it('should lint the selected PHP files with multiple PHP versions', function (done: MochaDone) : void {
            var targets: string[] = [
                'phplint-lint:cache-file-multi-php',
                'phplint-report-original:subjects'
            ];
            var result: SpawnResult;

            var expectedOutput: string = fs.readFileSync('fixtures/outputs/cache-file-multi-php.stdout.txt', {encoding: 'utf-8'})
                .replace(/\{\{ php55 }}/g, env.php55)
                .replace(/\{\{ php56 }}/g, env.php56)
                .replace(/\{\{ php70 }}/g, env.php70);

            result = runGrunt('Gruntfile.test.js', targets, [], ErrorCode.NoError);
            assert.equal(
                expectedOutput,
                (<Buffer> result.stdout).toString('utf-8')
            );

            var cacheKeyPrefixes: string[] = [
                '_cache:5.5:0-0:',
                '_cache:5.6:0-0:',
                '_cache:7.0:-:'
            ];
            var fileNames: string[] = fs.readdirSync(defaultTmpDir);
            var found: boolean;
            for (var cacheKeyPrefix of cacheKeyPrefixes) {
                found = false;
                for (var fileName of fileNames) {
                    if (fileName.indexOf(cacheKeyPrefix) === 0) {
                        found = true;

                        break;
                    }
                }

                assert.ok(found, 'Multi PHP cache key prefix ' + cacheKeyPrefix);
            }

            done();
        });

    });

})(chai.assert);
