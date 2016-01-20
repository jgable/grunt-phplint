# grunt-phplint

A Grunt task for linting your php.  A simple wrapper around the `php -l <filename>` command.

**Main features:**

* Multiple PHP version is supported
* Async
* Cache

The linting process done by 3 different Grunt tasks.

0. **phplint-lint** - Run the `php -l` command against the selected files and 
   store the result.
0. **phplint-report-original** - Create a human readable report from the stored
   lint result. As the name of the task suggest that the structure of the report
   is the same as the original output of the `php -l`.
   This is the only reporter shipped with this package, but you can easily 
   create a custom reporter.
0. **phplint-check** - The previous two tasks has no influence over the exit 
   codes. With this task you can abort the build process if the stored result
   contains any error.


## Example Gruntfile

Minimal configuration:
```javascript
grunt.initConfig({
  'phplint-lint': {
    source: {
      files: [
        {
          src: [
            'source/**/*.php'
          ]
        }
      ]
    }
  },
  'phplint-report-original': {
    source: {}
  },
  'phplint-check': {
    source: {}
  }
});

grunt.loadNpmTasks('grunt-phplint');
grunt.registerTask('phplint-source', [
  'phplint-lint:source',
  'phplint-report-original:source',
  'phplint-check:source'
);
```

Then run `grunt phplint-source`


## Options

By default we assume that the `php` command is in your path, if not, you can 
specify the full path to php.


### options.resultStorage

Type: `string[]`

Default: `['options', 'phplint-lint', 'result']`

The lint result will be stored with [grunt.option.set()](http://gruntjs.com/api/grunt.option#grunt.option)


### options.spawnLimit

Type: `number`

Default: `require('os').cpus().length`


### options.cache

Type: `object`

Default: `{engine: 'file', ttl: 36000, prefix: null, delimiter: ':'}`

In the background this package uses [cacheman](https://www.npmjs.com/package/cacheman)
to speed up the linting.
There are different configuration options for each cache engine.

***Common***
```javascript
{
  engine: string;
  prefix?: string;
  delimiter?: string;
  ttl?: number;
  count?: number;
}
```

**file**
```javascript
{
  tmpDir?: string;
}
```

**redis**
```javascript
{             
  password?: string; 
  host?: string;
  port?: number;
  database?: number;
}
```

**mongo**
```javascript
{
  username?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
  collection?: string;
  compression?: boolean;
}
```


### options.cacheClear

Type: `boolean`

Default: `false`

Set to `true` to clear the configured cache. **When `true` won't lint any file**.
Usually you don't need to set it *true* in the *options*, because you can 
control the cache clear from CLI flags. `grunt phplint-lint:foo:cache-clear`


### options.php

Multiple PHP executable definition.

Type: `object`

Default:
```javascript
{
  custom: {

    /**
     * Is this PHP variant enabled or not?
     *
     * @type {boolean}
     */
    enabled: true
    
    /**
     * Path to PHP executable.
     *
     * @type {string}
     */
    executable: 'php';

    args?: {
    
      /**
       * If not empty then the value will be added to the CLI command like this:
       * `php -c 'path/to/php.ini'`
       *
       * @type {string}
       */
      config: null;
    
      /**
       * Keys which have *true* value will be added as a '-d' option to the CLI 
       * command.
       *
       * Example: {define: {'short_open_tag=Off': true}}
       *
       * @type {[key: string]: boolean}
       */
      define: {}
    };
  }
}
```

**Example**
```javascript
grunt.config({
  'phplint-lint': {
    options: {
      php: {
        'my-php-55': {
          executable: 'path/to/php/5.5/bin/php'
          args: {
            define: {
              'short_open_tag=Off': true
            }
          }
        },
        'my-php-56': {
          executable: 'path/to/php/5.6/bin/php'
        }
      }
    },
    'php55-and-php56': {
      files: [
        {
          src: [
            'source/**/*.php'
          ]
        }
      ]
    },
    'disable-php55': {
      options: {
        php: {
          'my-php-55': {
            enabled: false
          }
        }
      },
      files: [
        {
          src: [
            'source/**/*.php'
          ]
        }
      ]
    }
  },
});
```


### License

Licensed under the MIT License, Copyright 2013 Jacob Gable
