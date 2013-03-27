grunt-phplint
=============

A Grunt task for linting your php.  A simple wrapper around the `php -l <filename>` command.

### Example Gruntfile

```javascript
var cfg = {
	phplint: {
		good: ["test/rsrc/*-good.php"],
		bad: ["test/rsrc/*-fail.php"]
	}
};

grunt.initConfig(cfg);

grunt.loadNpmTasks("grunt-phplint");

grunt.loadTasks("./tasks");

grunt.registerTask("default", ["phplint:good"]);
```

### Options

By default we assume that the `php` command is in your path, if not, you can specify the full path to php like the example below.  You can also pass additional flags, like '-lf'

```javascript
var cfg = {
	phplint: {
		options: {
			phpCmd: "/usr/bin/php", // Or "c:\EasyPHP-5.3.8.1\PHP.exe"
			phpArgs: {
				"-lf": null
			}
		},

		good: ["test/rsrc/*-good.php"],
		bad: ["test/rsrc/*-fail.php"]
	}
};
```

### License

Licensed under the MIT License, Copyright 2013 Jacob Gable