import { RegisterDecorator } from "./core";

export declare type DefaultFactory<TProp> = () => TProp;
export declare type DataDecorator = <TProp>(defaultValue?: DefaultFactory<TProp>) => PropertyDecorator;

export const Data = RegisterDecorator<string, DataDecorator>("Data", (target, key, descriptor, args, store, exclude) => {
    type Args = [DefaultFactory<any>];
    let [factory] = <Args>args;

    store({
        process(options, data) {
            data(() => {
                const val = {};
                val[key] = factory ? factory() : undefined;
                return val;
            });
        }
    });
});