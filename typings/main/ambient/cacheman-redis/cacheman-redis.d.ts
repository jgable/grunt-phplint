
declare module CachemanRedis {

    export interface IOptions extends Cacheman.IOptions {

        password?: string;

        host?: string;

        port?: number;

        database?: number;

        setex?: (
            key: string,
            ttl: number,
            value: any,
            // @todo Figure out the real type of this callback.
            callback: {() : void}
        ) => void;

    }

}

declare module 'cacheman-redis' {

    var e: Cacheman.Cacheman;

    export = e;

}
