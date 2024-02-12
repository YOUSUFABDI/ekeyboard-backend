import express from "express"
import authRouter from "./routes/authRoutes"
import createHttpError from "http-errors"

const app = express()

app.use(express.json())

app.use("/auth", authRouter)

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"))
})

export default app
