
declare module grunt {

    module task {

        interface ITask {

            filesSrc: string[];

        }

    }

    module config {

        /* tslint:disable:interface-name */
        interface ConfigModule {
        /* tslint:enable:interface-name */

            /**
             * Set a value into the project's Grunt configuration.
             * @note any specified <% %> template strings will only be processed when config data is retrieved.
             */
            set<T>(prop: string[], value: T) : T;

        }

    }

}
