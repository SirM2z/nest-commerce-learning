export interface CreateProductDTO {
  title: string;
  description: string;
  image: string;
  price: number;
}

// Partial 将所有属性设为可选
export type UpdateProductDTO = Partial<CreateProductDTO>;
