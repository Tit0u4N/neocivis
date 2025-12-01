import {Context} from "node:vm";
import {Hono} from "hono";

import {UserService} from "./user.service";


export class UserController {
    constructor(private service = new UserService()) {}

    routes() {
        const app = new Hono().basePath("/users")

        app.get("/", (c: Context) => c.json(this.service.getAll()))
        app.get("/:id", (c: Context) => this.getUser(c))

        return app
    }

    /////////////////////////////////////
    // Methods of the routes
    /////////////////////////////////////

    private getUser(c: Context) {
        const user = this.service.getById(c.req.param("id"))
        return user ? c.json(user) : c.json({ error: "User not found" }, 404)
    }

}