import * as Vue from "vue";
import { TypedMemberDecorator, RegisterDecorator, FunctionVoidReturn } from "./core";

export declare type EventDecorator = (evt?: string) => TypedMemberDecorator<string, FunctionVoidReturn>;

export const Emit = RegisterDecorator<string, EventDecorator>("Emit", (target, key, descriptor, args, store, exclude) => {
    type Args = [string];
    let [evt] = <Args>args;
    if (!evt) {
        evt = key;
    }
    const old = descriptor.value;
    // Replace the existing function with one that triggers the event
    descriptor.value = function (this: Vue) {
        this.$emit.apply(this, [evt, ...arguments]);
        // Trigger the old method to have code that runs after each time the event is triggered
        old.apply(this, arguments);
    };
});

export const On = RegisterDecorator<string, EventDecorator>("On", (target, key, descriptor, args, store, exclude) => {
    type Args = [string];
    let [evt] = <Args>args;
    if (!evt) {
        evt = key;
    }
    store({
        created(instance: Vue) {
            // Add a handler for the event pointed to the handler method
            instance.$on(evt, descriptor.value);
        }
    });
});