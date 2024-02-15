import { RequestHandler } from "express";
import createHttpError from "http-errors";
import adminModel from "../models/adminModel";

interface LoginBody {
  username: string;
  password: string;
}

const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (
  req,
  res,
  next
) => {
  const { username, password } = req.body;

  try {
    const user = await adminModel.findOne({ adminUserName: username }).exec();
    if (!user) {
      throw createHttpError(401, "Invalid username or password");
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    next(error);
  }
};

export default { login };
