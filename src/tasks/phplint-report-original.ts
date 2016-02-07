/**
 * @file
 * Grunt task to create a human readable report.
 */

import TaskHandler = require('../lib/grunt/tasks/ReportOriginalTask');

'use strict';

module.exports = function(g: IGrunt) : void {

    g.registerMultiTask(TaskHandler.taskName, TaskHandler.taskDescription, function() : void {
        TaskHandler.taskFunction(g, <grunt.task.IMultiTask<any>>this);
    });

};
