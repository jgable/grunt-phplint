
/* tslint:disable:interface-name */
declare module Cacheman {

    export interface CachemanError extends Error {

        new(message: string) : CachemanError;

    }

    export interface Cacheman {

        new (name: string, options?: IOptions) : Cacheman;

        /* tslint:disable:no-shadowed-variable */
        (options: IOptions) : Cacheman;
        /* tslint:enable:no-shadowed-variable */

        key() : void;

        use() : void;

        run() : void;

        cache() : void;

        get(key: string, fn?: Function) : Cacheman;

        get<T>(key: string, fn?: Function) : T;

        set(key: string, data: any, fn?: Function) : Cacheman;

        set<T>(key: string, data: T, ttl?: number, fn?: Function) : Cacheman;

        del(key: string, fn?: Function) : void;

        clear(fn?: Function) : void;

        wrap() : void;

    }

    export interface IOptions {

        engine: string;

        prefix?: string;

        delimiter?: string;

        ttl?: number;

        count?: number;

    }

}

declare module 'cacheman' {

    var e: Cacheman.Cacheman;

    export = e;
}
/* tslint:enable:interface-name */
