import { RequestHandler } from "express"
import createHttpError from "http-errors"
import prisma from "../../prisma/client"
import { CreateCategoryDT } from "../types/product"

const create: RequestHandler<
  unknown,
  unknown,
  CreateCategoryDT,
  unknown
> = async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) {
      throw createHttpError(400, "name is required")
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
      },
    })

    res.success("", category)
  } catch (error) {
    next(error)
  }
}

const findOne: RequestHandler<
  { categoryId: number },
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { categoryId } = req.params
    if (!categoryId) {
      throw createHttpError(400, "categoryId is required")
    }

    const category = await prisma.productCategory.findUnique({
      where: { id: Number(categoryId) },
    })
    if (!category) {
      throw createHttpError(404, "category not found")
    }

    res.success("", category)
  } catch (error) {
    next(error)
  }
}

const findAll: RequestHandler = async (req, res, next) => {
  try {
    const categories = await prisma.productCategory.findMany()
    if (!categories) {
      throw createHttpError(404, "No categories found")
    }

    res.success("", categories)
  } catch (error) {
    next(error)
  }
}

const remove: RequestHandler<
  { categoryId: number },
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  try {
    const { categoryId } = req.params
    if (!categoryId) {
      throw createHttpError(400, "categoryId is required")
    }

    await prisma.productCategory.delete({
      where: { id: Number(categoryId) },
    })

    res.success("category deleted successfully.")
  } catch (error) {
    next(error)
  }
}

export default {
  create,
  findOne,
  findAll,
  remove,
}
