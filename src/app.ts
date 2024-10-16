import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import createHttpError, { isHttpError } from "http-errors";
import authRouter from "./routes/authRoutes";
import orderRouter from "./routes/orderRoutes";
import productRouter from "./routes/productRoutes";
import categoryRouter from "./routes/categoryRouter";
import dotenv from "dotenv";
import resHandler from "./middlewares/resMiddleware";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// res handler middleware
app.use(resHandler);

app.get("/", (req, res) => {
  res.success("API is up and running", 200);
});
app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/orders", orderRouter);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error);

  if (isHttpError(error)) {
    res.error(error.message, error.statusCode);
  } else {
    res.error("An unknown error occurred", 400);
  }
});

export default app;
