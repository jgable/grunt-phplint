
declare module GruntPhpLint {

    export type KeyValue<T> = {
        [key: string]: T
    };

    export interface IResult {

        numOfLintedFiles: number;

        /**
         * Main key is the file path, the inner key is the cache key without
         * the hash.
         */
        invalidFiles: GruntPhpLint.KeyValue<GruntPhpLint.KeyValue<ICacheEntry>>;

    }

    export interface ICacheEntry {

        phpExecutable: string;

        phpCommandArgs: string[];

        exitCode: number;

        stdOut: string;

        stdError: string;

    }

    export interface IChildProcessExecError extends Error {

        killed?: boolean;

        code?: number;

        signal?: any;

        cmd?: string;

    }

    export interface IRegisterLintResultContext<T> {

        self: T;

        filePath: string;

        phpExecutable: string;

        phpCommandArgs: string[];

        cacheKeyItems: string[];

        cb: (error: Error) => void;

    }

    export interface IPhpMeta {

        version: string;

        commandArgs: string[];

        cacheKeyItems: string[];

    }

    export interface IPhpVariant {

        /**
         * Default: true.
         */
        enabled?: boolean;

        executable: string;

        args?: IPhpCliArgs;

    }

    export interface IPhpCliArgs {

        config?: string;

        define?: KeyValue<boolean>;

    }

    export module Grunt {

        export module Task {

            export module PhpLintLint {

                export interface IOptions {

                    resultStorage?: string[];

                    spawnLimit?: number;

                    cache?: Cacheman.IOptions;

                    cacheClear?: boolean;

                    php?: KeyValue<IPhpVariant>;

                }

                export interface ITarget extends grunt.task.ITaskOptions {

                    options?: IOptions;

                    files?: grunt.file.IFilesConfig[];

                }

                export interface ITask {

                    options?: IOptions;

                    [target: string]: ITarget;

                }
            }

            export module PhpLintReportHuman {

                export interface IOptions {

                    resultStorage?: string[];

                }

                export interface ITarget extends grunt.task.ITaskOptions {

                    options?: IOptions;

                }

                export interface ITask {

                    options?: IOptions;

                    [target: string]: ITarget;

                }

            }

            export module PhpLintCheck {

                export interface IOptions {

                    resultStorage?: string[];

                }

                export interface ITarget extends grunt.task.ITaskOptions {

                    options?: IOptions;

                }

                export interface ITask {

                    options?: IOptions;

                    [target: string]: ITarget;

                }

            }
        }

    }

}


declare module 'grunt-phplint' {

    export = GruntPhpLint;

}
