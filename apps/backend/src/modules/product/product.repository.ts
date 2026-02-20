import type { Product } from './product.types';

export class ProductRepository {
  private products: Product[] = [{ id: 'p1', label: 'Laptop' }];

  list(): Product[] {
    return this.products;
  }
}
