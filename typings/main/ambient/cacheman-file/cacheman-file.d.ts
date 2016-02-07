
declare module CachemanFile {

    export interface IOptions extends Cacheman.IOptions {

        tmpDir?: string;

    }

}

declare module 'cacheman-file' {

    var e: Cacheman.Cacheman;

    export = e;

}
