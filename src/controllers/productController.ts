import { RequestHandler } from "express"
import {
  CreateProductDT,
  UpdateProductDT,
  deleteProductParamsDT,
  updateProductParamsDT,
} from "../lib/types/product"

const createProduct: RequestHandler<
  unknown,
  unknown,
  CreateProductDT,
  unknown
> = async (req, res, next) => {}

const updateProduct: RequestHandler<
  updateProductParamsDT,
  unknown,
  UpdateProductDT,
  unknown
> = async (req, res, next) => {}

const deleteProduct: RequestHandler<
  deleteProductParamsDT,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {}

const getProducts: RequestHandler = async (req, res, next) => {}

const getOverviews: RequestHandler = async (req, res, next) => {}

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getOverviews,
}
