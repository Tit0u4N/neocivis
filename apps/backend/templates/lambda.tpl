/////////////////////////////////////////////
// Auto-generated file for lambdas.
// Normally you don't need to edit this file.
/////////////////////////////////////////////

import { handle } from "hono/aws-lambda"

import {{{Name}}Controller} from "../modules/{{name}}/{{Name}}.controller";

export const handler = handle(new {{Name}}Controller().routes());
