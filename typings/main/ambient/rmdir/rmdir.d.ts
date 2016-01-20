
declare module RmDir {

    export interface IRmDir {

        version: string;

        (
            dir: string,
            options?: RmDir.IOptions,
            callback?: (error?: Error) => void

        ) : void;

        (
            dir: string,
            callback?: (error?: Error) => void

        ) : void;

    }

    export interface IOptions {

        // @todo Proper type.
        fs?: any;

    }

}

declare module 'rmdir' {

    var e: RmDir.IRmDir;

    export = e;

}
