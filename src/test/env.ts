/**
 * @file
 * Initialize environment variables.
 */

import * as fs from 'fs';

var env: {
    php53: string;
    php54: string;
    php55: string;
    php56: string;
    php70: string;
    redisHost: string;
    redisPort: number;
    redisDatabase: number;
    mongoHost: string;
    mongoPort: number;
    mongoDatabase: string;
    mongoCollection: string;
};

env = null;

(function () : void {

    function getEnvValue<T>(name: string, defaultValue: T) : T {
        var value: T = (process.env.hasOwnProperty(name) ? <T>(process.env[name]) : defaultValue);

        if (name.match(/^PHPLINT_PHP_\d\d$/) && !fs.existsSync(<any>value)) {
            value = null;
        }

        return value;
    }

    // Default values are optimized for Travis CI.
    var phpPathPattern: string = process.env.HOME + '/.phpenv/versions/VERSION/bin/php';
    env = {
        php53: getEnvValue<string>('PHPLINT_PHP_53', phpPathPattern.replace('VERSION', '5.3')),
        php54: getEnvValue<string>('PHPLINT_PHP_54', phpPathPattern.replace('VERSION', '5.4')),
        php55: getEnvValue<string>('PHPLINT_PHP_55', phpPathPattern.replace('VERSION', '5.5')),
        php56: getEnvValue<string>('PHPLINT_PHP_56', phpPathPattern.replace('VERSION', '5.6')),
        php70: getEnvValue<string>('PHPLINT_PHP_70', phpPathPattern.replace('VERSION', '7.0')),
        redisHost: getEnvValue<string>('PHPLINT_REDIS_HOST', '127.0.0.1'),
        redisPort: getEnvValue<number>('PHPLINT_REDIS_PORT', 6379),
        redisDatabase: getEnvValue<number>('PHPLINT_REDIS_DATABASE', 1),
        mongoHost: getEnvValue<string>('PHPLINT_MONGO_HOST', '127.0.0.1'),
        mongoPort: getEnvValue<number>('PHPLINT_MONGO_PORT', 27017),
        mongoDatabase: getEnvValue<string>('PHPLINT_MONGO_DATABASE', 'grunt_phplint'),
        mongoCollection: getEnvValue<string>('PHPLINT_MONGO_COLLECTION', 'lint')
    };

})();

export = env;
