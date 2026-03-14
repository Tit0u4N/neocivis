import type { ProductRepository } from './product.repository';
import type { Product } from './product.types';

export class ProductService {
  constructor(private repository: ProductRepository) {}

  list(): Product[] {
    return this.repository.list();
  }
}
