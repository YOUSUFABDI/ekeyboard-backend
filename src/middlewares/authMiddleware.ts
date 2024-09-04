import { RequestHandler } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import prisma from "../../prisma/client"
import { CustomRequestWithUser } from "../lib/types/auth"
import createHttpError from "http-errors"

const protect: RequestHandler<unknown, unknown, unknown, unknown> = async (
  req,
  res,
  next
) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
      if (!token) {
        throw createHttpError("Token is not provided")
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload

      const user = await prisma.user.findFirst({
        where: { id: decoded.id },
      })
      if (user) {
        ;(req as CustomRequestWithUser).user = {
          id: user.id,
          role: user.role,
        }
      }

      return next()
    } else {
      throw createHttpError(401, "You are not loggin. Please loggin")
    }
  } catch (error) {
    console.log("error", error)
    if (error.name === "JsonWebTokenError") {
      console.log("Invalid token", error)
      return next(createHttpError(401, "Invalid token"))
      // return next(createHttpError(401, "You are not Loggin, please Loggin"))
    } else {
      console.log("Error in protect middleware", error)
      return next(error)
    }
  }
}

const restrictTo = (
  ...roles: string[]
): RequestHandler<unknown, unknown, unknown, unknown> => {
  return async (req, res, next) => {
    try {
      let token

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1]
        if (!token) {
          throw createHttpError("Token is not provided")
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload

        const user = await prisma.user.findFirst({
          where: { id: decoded.id },
        })
        if (user) {
          ;(req as CustomRequestWithUser).user = {
            id: user.id,
            role: user.role,
          }
        }

        if (!roles.includes(user.role)) {
          return next(
            createHttpError(
              403,
              "You do not have permission to perform this action"
            )
          )
        }

        next()
      } else {
        throw createHttpError(401, "You are not loggin. Please loggin")
      }
    } catch (error) {
      next(error)
    }
  }
}

export default { restrictTo, protect }
