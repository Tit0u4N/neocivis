import { handle } from "hono/aws-lambda"

import {UserController} from "../modules/user/user.controller";

export const handler = handle(new UserController().routes());