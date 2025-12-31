import {Context} from "node:vm";
import {Hono} from "hono";

import {{{Name}}Service} from "./{{name}}.service";


export class {{Name}}Controller {
    constructor(private service = new {{Name}}Service()) {}

    routes() {
        const app = new Hono()

        app.get("/", (c: Context) => c.text("{{name}} route ok"));
        app.get("/hello", (c: Context) => this.hello(c));

        return app
    }


    /////////////////////////////////////
    // Methods of the routes
    /////////////////////////////////////

    private hello(c: Context) {
        return c.text(this.service.hello());
    }

}