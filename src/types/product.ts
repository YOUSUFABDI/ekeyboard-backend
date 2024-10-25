export type CreateProductDT = {
  productName: string
  productPrice: number
  productDescription: string
  productImage: string[]
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
  categoryId: number
}

export type updateProductParamsDT = {
  productId: string
}

export type removeProductParamsDT = {
  productId: string
}

export type CreateCategoryDT = {
  name: string
}

export type deleteMultipleProductsDT = {
  productIds: number[]
}
