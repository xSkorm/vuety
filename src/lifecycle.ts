import { TypedMemberDecorator, RegisterDecorator } from "./core";

export type LifecycleNames =
    "beforeCreate" | "created" |
    "beforeDestroy" | "destroyed" |
    "beforeMount" | "mounted" |
    "beforeUpdate" | "updated" |
    "activated" | "deactivated"

export declare type LifecycleDecorator = () => TypedMemberDecorator<LifecycleNames, () => void>;

export const Lifecycle = RegisterDecorator<LifecycleNames, LifecycleDecorator>("Lifecycle", (target, key, descriptor, args, store, exclude) => {
    store({
        process(options) {
            // Store the handler in the options to be called by vue
            options[key] = descriptor.value;

            // Prevent calling a lifecycle function
            delete target[key];
        }
    });
});