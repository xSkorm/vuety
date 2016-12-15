import * as Vue from "vue";
import { RegisterDecorator } from "./core";

export type Constructor<TType> = {
    new (...args: any[]): TType;
}

export interface PropOptions<TProp> extends Vue.PropOptions {
    type?: Constructor<TProp> | Constructor<TProp>[] | null;
    required?: boolean;
    default?: TProp;
    validator?(value: TProp): boolean;
}

export declare type PropDecorator = <TProp>(opt?: PropOptions<TProp>) => PropertyDecorator;

export const Prop = RegisterDecorator<string, PropDecorator>("Prop", (target, key, descriptor, args, store, exclude) => {
    type Args = [Vue.PropOptions];
    let [opt] = <Args>args;
    if (!opt) {
        opt = {};
    }

    // If we have a default value we can use this for the type
    if (opt.default !== undefined && opt.default !== null && !opt.type) {
        opt.type = opt.default.constructor;
    }

    store({
        process(options) {
            // Update the props object with our property
            if (!options.props) {
                options.props = {};
            }
            options.props[key] = opt;
        }
    });
});