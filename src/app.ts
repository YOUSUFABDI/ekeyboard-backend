import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import createHttpError, { isHttpError } from "http-errors"
import authRouter from "./routes/authRoutes"
import orderRouter from "./routes/orderRoutes"
import productRouter from "./routes/productRoutes"
import dotenv from "dotenv"
import resHandler from "./middlewares/resMiddleware"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.options("*", cors())

// res handler middleware
app.use(resHandler)

app.get("/", (req, res) => {
  res.success("API is running", 200)
})
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/orders", orderRouter)

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"))
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error)

  if (isHttpError(error)) {
    res.error(error.message, error.statusCode)
  } else {
    res.error("An unknown error occurred", 400)
  }
})

export default app
