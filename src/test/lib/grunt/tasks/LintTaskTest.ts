/**
 * @file
 */

import LintTask = require('../../../../lib/grunt/tasks/LintTask');
import chai = require('chai');

(function (assert: Chai.AssertStatic) : void {

    type FilterEnabledCase = {

        msg: string;

        items: GruntPhpLint.KeyValue<boolean | Object>;

        property: string;

        expected: string[];

    };

    describe('lib/grunt/tasks/LintTask::filterEnabled()', function () : void {

        var cases: FilterEnabledCase[] = [
            {
                msg: 'Empty list',
                items: {},
                property: null,
                expected: []
            },
            {
                msg: 'All enabled',
                items: {item1: true,
                    item2: true},
                property: null,
                expected: [ 'item1',
                    'item2']
            },
            {
                msg: 'First enabled',
                items: {
                    item1: true,
                    item2: false
                },
                property: null,
                expected: [
                    'item1'
                ]
            },
            {
                msg: 'Last enabled',
                items: {
                    item1: false,
                    item2: true
                },
                property: null,
                expected: ['item2']
            },
            {
                msg: 'Objects with enabled and status properties with the default property name',
                items: {
                    item1: {enabled: true, status: false},
                    item2: {enabled: false, status: true}
                },
                property: null,
                expected: [
                    'item1'
                ]
            },
            {
                msg: 'Objects with enabled and status properties but override the default property name',
                items: {
                    item1: {enabled: true, status: false},
                    item2: {enabled: false, status: true}
                },
                property: 'status',
                expected: [
                    'item2'
                ]
            }
        ];

        cases.forEach(function (c: FilterEnabledCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                assert.deepEqual(
                    LintTask.filterEnabled(c.items, c.property),
                    c.expected
                );
                done();
            });
        });

    });

    describe('lib/grunt/tasks/LintTask::defaultOptions()', function () : void {

        it('should', function (done: MochaDone) : void {
            var task: any = {name: 'my-task'};
            var dv: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions = LintTask.defaultOptions(task);
            assert.deepEqual(dv.resultStorage, ['options', 'my-task', 'result']);
            assert.equal(dv.cacheClear, false);
            assert.equal(dv.cache.engine, 'file');

            done();
        });

    });

    type ProcessTestArgsCase = {

        msg: string;

        base: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions;

        args: string[];

        expected: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions;

    };

    describe('lib/grunt/tasks/LintTask::processTaskArgs()', function () : void {

        var myGrunt: IGrunt = require('grunt');
        var cases: ProcessTestArgsCase[] = [
            {
                msg: 'it should disable caching',
                base: {
                    cache: {
                        engine: 'redis'
                    }
                },
                args: [
                    'no-cache'
                ],
                expected: {
                    cache: {
                        engine: null
                    }
                }
            },
            {
                msg: 'it should clear the cache',
                base: {
                    cache: {
                        engine: 'redis'
                    }
                },
                args: [
                    'cache-clear'
                ],
                expected: {
                    cacheClear: true,
                    cache: {
                        engine: 'redis'
                    }
                }
            },
            {
                msg: 'it should override spawnLimit with 42',
                base: {
                    spawnLimit: 7
                },
                args: [
                    'sl-21',
                    'sl-42'
                ],
                expected: {
                    spawnLimit: 42
                }
            },
            {
                msg: 'it should override ttl with 42',
                base: {
                    cache: {
                        engine: 'redis',
                        ttl: 7
                    }
                },
                args: [
                    'ttl-21',
                    'ttl-42'
                ],
                expected: {
                    cache: {
                        engine: 'redis',
                        ttl: 42
                    }
                }
            },
            {
                msg: 'it should override everything',
                base: {
                    spawnLimit: 1,
                    cache: {
                        engine: 'redis',
                        ttl: 2
                    }
                },
                args: [
                    'no-cache',
                    'sl-3',
                    'ttl-4'
                ],
                expected: {
                    spawnLimit: 3,
                    cache: {
                        engine: null,
                        ttl: 4
                    }
                }
            },
            {
                msg: "it shouldn't override anything",
                base: {
                    spawnLimit: 12,
                    cache: {
                        engine: 'redis',
                        ttl: 7
                    }
                },
                args: [
                    'unknown-1',
                    'unknown-2'
                ],
                expected: {
                    spawnLimit: 12,
                    cache: {
                        engine: 'redis',
                        ttl: 7
                    }
                }
            }
        ];

        cases.forEach(function (c: ProcessTestArgsCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                LintTask.processTaskArgs(myGrunt, c.base, c.args);
                assert.deepEqual(c.base, c.expected);
                done();
            });
        });

    });

    type BuildPhpCommandArgsCase = {

        msg: string;

        phpCliArgs: GruntPhpLint.IPhpCliArgs;

        expected: string[];

    };

    describe('lib/grunt/tasks/LintTask::buildPhpCommandArgs()', function () : void {

        var cases: BuildPhpCommandArgsCase[] = [
            {
                msg: 'It should return an empty array 1',
                phpCliArgs: {},
                expected: []
            },
            {
                msg: 'It should add "-c foo.ini"',
                phpCliArgs: {
                    config: 'foo.ini'
                },
                expected: [
                    '-c',
                    'foo.ini'
                ]
            },
            {
                msg: 'It should add "-d foo=bar -d baz=boo"',
                phpCliArgs: {
                    define: {
                        'foo=bar': true,
                        'baz=boo': true
                    }
                },
                expected: [
                    '-d',
                    'foo=bar',
                    '-d',
                    'baz=boo'
                ]
            },
            {
                msg: 'It should add "-c foo.ini -d foo=bar -d baz=boo"',
                phpCliArgs: {
                    config: 'foo.ini',
                    define: {
                        'foo=bar': true,
                        'baz=boo': true,
                        'ignore=yes': false
                    }
                },
                expected: [
                    '-c',
                    'foo.ini',
                    '-d',
                    'foo=bar',
                    '-d',
                    'baz=boo'
                ]
            }
        ];

        cases.forEach(function (c: BuildPhpCommandArgsCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                assert.deepEqual(
                    LintTask.buildPhpCommandArgs(c.phpCliArgs),
                    c.expected
                );
                done();
            });
        });

    });

    type BuildPhpCommandArgsForLintCase = {

        msg: string;

        values: GruntPhpLint.KeyValue<any>;

        expected: string[];

    };

    describe('lib/grunt/tasks/LintTask::buildPhpCommandArgsForLint()', function () : void {

        var cases: BuildPhpCommandArgsForLintCase[] = [
            {
                msg: 'It should return with extra -d arguments',
                values: {
                    myNumber: 42,
                    myTrue: true,
                    myFalse: false,
                    myString: 'ok'
                },
                expected: [
                    '-n',
                    '-d',
                    'myNumber=42',
                    '-d',
                    'myTrue=1',
                    '-d',
                    'myFalse=0',
                    '-d',
                    'myString=ok',
                    '-l'
                ]
            },
            {
                msg: "It should add only the default '-n -l' arguments",
                values: {
                    myNumber: 42,
                    myTrue: true,
                    myFalse: false,
                    myString: 'ok'
                },
                expected: [
                    '-n',
                    '-d',
                    'myNumber=42',
                    '-d',
                    'myTrue=1',
                    '-d',
                    'myFalse=0',
                    '-d',
                    'myString=ok',
                    '-l'
                ]
            }
        ];

        cases.forEach(function (c: BuildPhpCommandArgsForLintCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                assert.deepEqual(
                    LintTask.buildPhpCommandArgsForLint(c.values),
                    c.expected
                );
                done();
            });
        });

    });

    type SyntaxModifierCacheKeyCase = {

        msg: string;

        values: GruntPhpLint.KeyValue<string | number | boolean>;

        expected: string;

    };

    describe('lib/grunt/tasks/LintTask::getSyntaxModifierCacheKey()', function () : void {

        var cases: SyntaxModifierCacheKeyCase[] = [
            {
                msg: 'It should return an "-"',
                values: {},
                expected: '-'
            },
            {
                msg: 'It should return a long cache key',
                values: {
                    'a': false,
                    'b': true,
                    'c': 0,
                    'd': 2,
                    'e': '',
                    'f': 'str'
                },
                expected: '0-1-0-2--str'
            }
        ];

        cases.forEach(function (c: SyntaxModifierCacheKeyCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                assert.deepEqual(
                    LintTask.getSyntaxModifierCacheKey(c.values),
                    c.expected
                );
                done();
            });
        });

    });

    type GetPhpVersionCacheKeyCase = {

        msg: string;

        phpVersion: string;

        expected: string;

    };

    describe('lib/grunt/tasks/LintTask::getPhpVersionCacheKey()', function () : void {

        var cases: GetPhpVersionCacheKeyCase[] = [
            {
                msg: 'It should do something',
                phpVersion: '5.5.30',
                expected: '5.5'
            },
            {
                msg: 'It should do something',
                phpVersion: '5.6.15',
                expected: '5.6'
            }
        ];

        cases.forEach(function (c: GetPhpVersionCacheKeyCase) : void {
            it(c.msg, function (done: MochaDone) : void {
                assert.deepEqual(
                    LintTask.getPhpVersionCacheKey(c.phpVersion),
                    c.expected
                );
                done();
            });
        });

    });

    type GetSyntaxModifierIniOptionsCase = {

        phpVersion: string;

        expected: GruntPhpLint.KeyValue<string>;

    };

    describe('lib/grunt/tasks/LintTask::getSyntaxModifierIniOptions()', function () : void {

        var cases: GetSyntaxModifierIniOptionsCase[] = [
            {
                phpVersion: null,
                expected: null
            },
            {
                phpVersion: 'invalid',
                expected: null
            },
            {
                phpVersion: '4.8.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '4.42.42',
                expected: {
                    'foo': 'boolean',
                    'bar': 'string'
                }
            },
            {
                phpVersion: '5.2.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '5.3.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '5.4.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '5.5.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '5.6.42',
                expected: {
                    'short_open_tag': 'boolean',
                    'asp_tags': 'boolean'
                }
            },
            {
                phpVersion: '7.0.42',
                expected: null
            }
        ];

        var options: GruntPhpLint.Grunt.Task.PhpLintLint.IOptions = {};
        var task: any = {};
        var myGrunt: IGrunt = require('grunt');
        var linter: any = new LintTask(options, task, myGrunt);

        linter.syntaxModifierIniOptions['4.42'] = {
            'foo': 'boolean',
            'bar': 'string'
        };

        cases.forEach(function (c: GetSyntaxModifierIniOptionsCase) : void {
            it(JSON.stringify(c.phpVersion), function (done: MochaDone) : void {
                assert.deepEqual(
                    linter.getSyntaxModifierIniOptions(c.phpVersion),
                    c.expected
                );
                done();
            });
        });

    });

})(chai.assert);
