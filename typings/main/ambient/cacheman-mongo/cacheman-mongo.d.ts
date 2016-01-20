
declare module CachemanMongo {

    export interface IOptions extends Cacheman.IOptions {

        username?: string;

        password?: string;

        host?: string;

        port?: number;

        database?: string;

        collection?: string;

        compression?: boolean;

    }

}

declare module 'cacheman-mongo' {

    var e: Cacheman.Cacheman;

    export = e;

}
