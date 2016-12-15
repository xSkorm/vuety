import * as Vue from "vue";
import { TypedMemberDecorator, RegisterDecorator } from "./core";

export declare type WatchHandler<T> = (val: T, oldVal: T) => void

// TODO: Ensure that propName is keyof decorated type
export declare type WatchDecorator = <TProp>(propName: string, opts?: Vue.WatchOptions) => TypedMemberDecorator<string, WatchHandler<TProp>>;

export const Watch = RegisterDecorator<string, WatchDecorator>("Watch", (target, key, descriptor, args, store, exclude) => {
    type Args = [string, Vue.WatchOptions];
    let [prop, opt] = <Args>args;

    if (opt) {
        (opt as { [key: string]: any })["handler"] = descriptor.value;
    }

    store({
        process(options) {
            if (!options.watch) {
                options.watch = {};
            }
            options.watch[prop] = <any>opt || descriptor.value;
        }
    });
});