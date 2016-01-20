/**
 * @file
 * Documentation missing.
 *
 * @see http://stackoverflow.com/questions/16633246/code-coverage-with-mocha
 */

import env = require('./test/env');

module.exports = function (g: IGrunt) : void {
    'use strict';

    var cache: {
        none: any;
        file: CachemanFile.IOptions;
        redis: CachemanRedis.IOptions;
        mongo: CachemanMongo.IOptions;
    };

    cache = {
        none: null,
        file: {
            engine: 'file'
        },
        redis: {
            engine: 'redis',
            host: env.redisHost,
            port: env.redisPort,
            database: env.redisDatabase
        },
        mongo: {
            engine: 'mongo',
            host: env.mongoHost,
            port: env.mongoPort,
            database: env.mongoDatabase,
            collection: env.mongoCollection
        }
    };

    g.initConfig({
        'phplint-lint': {
            options: {
                cache: cache.none
            },
            'cache-none-exit-true': {
                files: [
                    {
                        src: [
                            'fixtures/subjects/le-52-sot0-1.php'
                        ]
                    }
                ]
            },
            'cache-none-exit-false': {
                files: [
                    {
                        src: [
                            'fixtures/subjects/le-70-sot0-0.php'
                        ]
                    }
                ]
            },
            'cache-file-exit-false': {
                options: {
                    cache: cache.file
                },
                files: [
                    {
                        src: [
                            'fixtures/subjects/le-*-sot0-0.php'
                        ]
                    }
                ]
            },
            'empty': {
                files: [
                    {
                        src: [
                            'fixtures/subjects/not-exists.php'
                        ]
                    }
                ]
            },
            'cache-redis': {
                options: {
                    cache: cache.redis
                },
                files: [
                    {
                        src: [
                            'fixtures/subjects/le-56-*.php'
                        ]
                    }
                ]
            },
            'cache-file-multi-php': {
                options: {
                    cache: cache.file,
                    php: {
                        'v55': {
                            executable: env.php55,
                            args: {
                                define: {
                                    'short_open_tag=Off': true,
                                    'asp_tags=Off': true
                                }
                            }
                        },
                        'v56': {
                            executable: env.php56,
                            args: {
                                define: {
                                    'short_open_tag=Off': true,
                                    'asp_tags=Off': true
                                }
                            }
                        },
                        'v70': {
                            executable: env.php70
                        }
                    }
                },
                files: [
                    {
                        src: [
                            'fixtures/subjects/le-{55,56,70}-*.php'
                        ]
                    }
                ]
            }
        },
        'phplint-report-original': {
            subjects: {}
        },
        'phplint-check': {
            subjects: {}
        }
    });

    g.loadTasks('tasks');
    g.registerTask('default', [
        'phplint-lint:subjects-file',
        'phplint-report-original:subjects',
        'phplint-check:subjects'
    ]);
};
