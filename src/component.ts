import * as Vue from "vue";
import * as _ from "lodash";
import { VuetyVue, symbolStore } from "./core";

export function Component(options?: Vue.ComponentOptions<Vue>): (target: Function) => any
export function Component<TOptions extends Vue.ComponentOptions<Vue>>(options: TOptions) {
    return function (target: Function) {
        // Ensure that options is valid
        if (!options) {
            options = options || {} as TOptions;
        }

        // If no name is specified use the class name 
        if (!options.name) {
            options.name = _.kebabCase(target.name);
        }

        const proto: VuetyVue = target.prototype;

        let onCreated: ((instance: Vue) => void)[] = [];
        let dataStore: ((this: Vue) => {})[] = [];

        if (proto.$$Vuety) {
            // Process any registered decorators
            symbolStore.forEach(sym => {
                if (proto.$$Vuety[sym]) {
                    proto.$$Vuety[sym].forEach(store => {
                        if (store.process) {
                            store.process(options, fn => {
                                dataStore.push(fn);
                            });
                        }
                        // If the decorator requires a created hook then store this
                        if (store.created) {
                            onCreated.push(store.created);
                        }
                    });
                }
            });
        }

        // Process any instance methods that are not excluded into the Vue methods object
        Object.getOwnPropertyNames(target.prototype).filter(p => p !== "constructor").forEach(prop => {
            if (!proto.$$Exclude || proto.$$Exclude.indexOf(prop) === -1) {
                const descriptor = Object.getOwnPropertyDescriptor(target.prototype, prop);
                if (!descriptor.get && !descriptor.set) {
                    if (!options.methods) {
                        options.methods = {};
                    }
                    options.methods[prop] = descriptor.value;
                } else {
                    if (!options.computed) {
                        options.computed = {};
                    }
                    options.computed[prop] = {
                        get: descriptor.get,
                        set: descriptor.set
                    };
                }
            }
        });

        // Remove temp storage variables
        delete proto["$$Vuety"];
        delete proto["$$Exclude"];

        if (dataStore.length > 0) {
            options.data = function (this: Vue) {
                const obj = {};
                dataStore.forEach(ds => Object.assign(obj, ds.call(this)));
                return obj;
            };
        }

        // If we have any created hooks we need to ensure the created lifecycle is updated
        if (onCreated.length > 0) {
            let old: () => void;
            if (options.created) {
                old = options.created;
            }
            options.created = function (this: Vue) {
                onCreated.forEach(m => {
                    m(this);
                });
                // If there was already a created method invoke it
                if (old) {
                    old();
                }
            };
        }

        // Extend the Vue class with the default options
        return (target as any).extend(options);
    };
}