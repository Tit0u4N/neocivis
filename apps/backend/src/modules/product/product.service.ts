import { db } from '../../shared/database';
import type { Product } from './product.types';

export class ProductService {
 list(): Product[] {
  return db.products;
 }
}
