import { Request } from "express"

export type LoginBodyDT = {
  username: string
  password: string
}

export interface CustomRequestWithUser extends Request {
  user?: any
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

export type updateProductParamsDT = {
  productID: string
}

export type deleteProductParamsDT = {
  productID: string
}

export type MakeOrderBodyDT = {
  quantity: number
  productID: string
}
