import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import authRouter from "./routes/authRoutes"
import productRouter from "./routes/productRoutes"
import orderRouter from "./routes/orderRoutes"
import createHttpError, { isHttpError } from "http-errors"
import { rateLimit } from "express-rate-limit"

const app = express()

app.use(express.json())
app.use(cors())
app.options("*", cors())

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
})
app.use("/api", limiter)

app.use("/api/test", (req, res) => {
  res.status(200).json({ message: "Hello World!" })
})
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/orders", orderRouter)

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"))
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occurred"
  let statusCode = 500
  console.log(error)

  if (isHttpError(error)) {
    statusCode = error.status
    errorMessage = error.message
  }

  res.status(statusCode).json({ error: errorMessage })
})

export default app
