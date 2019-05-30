import { Product } from '../types/product';

interface ProductOrderDTO {
  product: Product[];
  quantity: number;
}

export interface CreateOrderDTO {
  products: ProductOrderDTO[];
}
