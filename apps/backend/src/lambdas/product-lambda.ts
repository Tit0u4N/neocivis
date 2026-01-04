import { handle } from 'hono/aws-lambda';

import { ProductController } from '../modules/product/product.controller';

export const handler = handle(new ProductController().routes());
