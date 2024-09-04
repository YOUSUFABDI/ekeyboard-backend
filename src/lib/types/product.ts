export type CreateProductDT = {
  productName: string
  productPrice: number
  productDescription: string
  productImage: Express.Multer.File[]
  productLikes: number
  productStock: number
  categoryId: number
}

export type UpdateProductDT = {
  productName: string
  productPrice: number
  productDescription: string
  productImage: string[]
  productLikes: number
  productStock: number
}

export type updateProductParamsDT = {
  productID: string
}

export type deleteProductParamsDT = {
  productID: string
}

export type CreateCategoryDT = {
  name: string
}
