import * as Vue from "vue";
import { Watch, Component, Data, Emit, Lifecycle, On, Prop, Render } from "src";

@Component()
class Child extends Vue {
    @Prop({
        default: "hello"
    }) public property: string;

    @Lifecycle() protected mounted() {
        console.log("Lifecycle", "mounted", this.property);
    }

    @Lifecycle() protected created() {
        console.log("Lifecycle", "created", this.property);
    }

    @Render() protected render(c: Vue.CreateElement) {
        console.log("Render");
        return c("button", this.property);
    }

    @Watch<string>("property") protected onTestChanged(newValue: string, oldValue: string) {
        console.log("Property changed: ", oldValue, "->", newValue);
    }
}

@Component({
    template: `<div><child :property="message + computed"/></div>`,
    components: {
        "child": Child
    }
})
class Test extends Vue {
    @Data(() => "hi") protected message: string;

    public get computed() {
        return (this.message || "").split("").reverse().join("");
    }

    @Lifecycle() protected mounted() {
        console.log("Lifecycle", "mounted");
        this.loaded("testing");

        setTimeout(() => this.message = "one", 1000);
        setTimeout(() => this.message = "two", 2000);
        setTimeout(() => this.message = "three", 3000);
    }

    @Lifecycle() protected created() {
        console.log("Lifecycle", "created");
    }

    @Emit() protected loaded(message: string) {
        console.log("Emitted", "loaded", message);
    }

    @On("loaded") protected onLoaded(message: string) {
        console.log("On", "loaded", message);
    }
}

export function go() {
    var x = new Test();
    x.$mount("#app");
}
