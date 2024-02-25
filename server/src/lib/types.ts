export type LoginBodyDT = {
  username: string
  password: string
}

export type signupBodyDT = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  username?: string
  password?: string
}

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
  productImage: string
  productLikes: number
  productStock: number
}
