import express, { NextFunction, Request, Response } from "express"
import authRouter from "./routes/authRoutes"
import adminRouter from "./routes/adminRoutes"
import createHttpError, { isHttpError } from "http-errors"

const app = express()

app.use(express.json())

app.use("/auth", authRouter)
app.use("/admin", adminRouter)

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"))
})

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occurred"
  let statusCode = 500

  if (isHttpError(error)) {
    statusCode = error.status
    errorMessage = error.message
  }

  res.status(statusCode).json({ error: errorMessage })
})

export default app
