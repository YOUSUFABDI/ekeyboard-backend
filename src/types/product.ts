export type CreateProductDT = {
  productName: string;
  productPrice: number;
  productDescription: string;
  productImage: Express.Multer.File[];
  productStock: number;
  categoryId: number;
};

export type UpdateProductDT = {
  productName: string;
  productPrice: number;
  productDescription: string;
  productImage: string[];
  productLikes: number;
  productStock: number;
};

export type updateProductParamsDT = {
  productId: string;
};

export type removeProductParamsDT = {
  productId: string;
};

export type CreateCategoryDT = {
  name: string;
};
