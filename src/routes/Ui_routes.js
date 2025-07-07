import express from "express";
import home from "../api/v1/home/home.js"; // Adjust the import path as necessary

const router = express.Router();

router.use("/", home);

export default router;
