import * as Vue from "vue";

export const symbolStore: symbol[] = [];

export declare type Collector<TKey extends string> = (
    target: Vue,
    propertyKey: TKey,
    descriptor: PropertyDescriptor,
    args: any[],
    store: (store: VuetyStore) => void,
    exclude: (name: string) => void) => void;

export declare type MemberDecorator<TKey extends string> = (target: Vue, propertyKey: TKey, descriptor: PropertyDescriptor) => any;
export declare type TypedMemberDecorator<TKey extends string, TDescriptor> = (target: Vue, propertyKey: TKey, descriptor: TypedPropertyDescriptor<TDescriptor>) => any;
export declare type DecoratorFunction<TRestriction extends string> = (...args: any[]) => MemberDecorator<TRestriction>;
export declare type FunctionVoidReturn = (...args: any[]) => void;

export interface VuetyVue extends Vue {
    $$Vuety: { [key: string]: VuetyStore[]; };
    $$Exclude: string[];
}

export interface VuetyStore {
    process?: (options: Vue.ComponentOptions<Vue>, data: (factory: (this: Vue) => {}) => void) => void;
    created?: (instance: Vue) => void;
}

export function RegisterDecorator<TRestriction extends string, TArguments extends DecoratorFunction<TRestriction>>(name: string, collect: Collector<TRestriction>) {
    const sym = Symbol(name);
    symbolStore.push(sym);

    return function () {
        const args = arguments;
        return function (target: VuetyVue, propertyKey: TRestriction, descriptor: PropertyDescriptor) {
            // Store that the current decorator requires actions to be performed later (on new or on vue created)
            const store = (d: VuetyStore) => {
                if (!target.$$Vuety) {
                    target.$$Vuety = {};
                }
                if (!target.$$Vuety[sym]) {
                    target.$$Vuety[sym] = [];
                }
                target.$$Vuety[sym].push(d);
            };

            // Allow the decorator to exclude certain methods from being handled by default
            const exclude = (name: string) => {
                if (!target.$$Exclude) {
                    target.$$Exclude = [];
                }
                target.$$Exclude.push(name);
            };

            // Invoke the decorator
            collect(target, propertyKey, descriptor, [...args], store, exclude);
        };
    } as TArguments;
}