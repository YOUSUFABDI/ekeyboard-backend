export type CreateProductDT = {
  productName: string
  productPrice: number
  productDescription: string
  productImage: string
  productLikes: number
  productStock: number
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
