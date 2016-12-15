import * as Vue from "vue";
import { TypedMemberDecorator, RegisterDecorator, FunctionVoidReturn } from "./core";

export declare type VueGetter = (instance: Vue) => Vue;
export declare type EventDecorator = (evt?: string, target?: VueGetter) => TypedMemberDecorator<string, FunctionVoidReturn>;
export declare type EventDecorator2 = (target?: VueGetter) => TypedMemberDecorator<string, FunctionVoidReturn>;

function processArgs(key: string, instance: Vue, args: any[]) {
    type Args = [string | VueGetter, VueGetter];
    let [arg, getter] = <Args>args;
    let evt: string | null = null;
    let obj: Vue | null = null;
    if (arg) {
        if (typeof arg === "string") {
            evt = arg;
            if (getter) {
                obj = getter(instance);
            }
        } else {
            obj = arg(instance);
        }
    }
    return {
        evt: evt || key,
        obj: obj || instance
    };
}

export const Emit = RegisterDecorator<string, EventDecorator & EventDecorator2>("Emit", (target, key, descriptor, args, store, exclude) => {
    const old = descriptor.value;
    // Replace the existing function with one that triggers the event
    descriptor.value = function (this: Vue) {
        const {obj, evt} = processArgs(key, this, args);

        obj.$emit.apply(this, [evt, ...arguments]);
        // Trigger the old method to have code that runs after each time the event is triggered
        old.apply(this, arguments);
    };
});

export const On = RegisterDecorator<string, EventDecorator & EventDecorator2>("On", (target, key, descriptor, args, store, exclude) => {
    store({
        created(instance: Vue) {
            const {obj, evt} = processArgs(key, instance, args);
            // Add a handler for the event pointed to the handler method
            obj.$on(evt, descriptor.value.bind(instance));
        }
    });
});