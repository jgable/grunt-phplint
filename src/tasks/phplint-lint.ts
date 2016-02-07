/**
 * @file
 * Grunt task to lint PHP files.
 */

import TaskHandler = require('../lib/grunt/tasks/LintTask');

'use strict';

module.exports = function(g: IGrunt) : void {

    g.registerMultiTask(TaskHandler.taskName, TaskHandler.taskDescription, function() : void {
        TaskHandler.taskFunction(g, <grunt.task.IMultiTask<any>>this);
    });

};
