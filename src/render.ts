import * as Vue from "vue";
import { TypedMemberDecorator, RegisterDecorator } from "./core";

export declare type RenderRestriction = "render";
export declare type RenderFunction = (createElement: Vue.CreateElement) => Vue.VNode;
export declare type RenderDecorator = () => TypedMemberDecorator<RenderRestriction, RenderFunction>;

export const Render = RegisterDecorator<RenderRestriction, RenderDecorator>("Render", (target, key, descriptor, args, store, exclude) => {
    store({
        process(options) {
            options[key] = descriptor.value;
            delete target[key];
        }
    });
});
