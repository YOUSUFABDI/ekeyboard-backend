import express from "express";
import adminController from "../controllers/adminController";

const router = express.Router();
const { login } = adminController;

router.post("/", login);

export default router;
