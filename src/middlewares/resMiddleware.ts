import { Request, Response, NextFunction } from "express"

declare module "express-serve-static-core" {
  interface Response {
    success: (message?: string, payload?: any) => void
    error: (message: string, statusCode?: number) => void
  }
}

const resHandler = (req: Request, res: Response, next: NextFunction) => {
  res.success = (message: string, payload: any = null) => {
    res.status(200).json({
      statusCode: 200,
      payload: {
        message: message,
        data: payload,
      },
      error: null,
    })
  }

  res.error = (message: string, statusCode: number = 400) => {
    res.status(400).json({
      statusCode: 400,
      payload: null,
      error: {
        statusCode: 400,
        message: message,
      },
    })
  }

  next()
}

export default resHandler
