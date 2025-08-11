import express from "express";
import home from "../api/routes/home.js"; // Adjust the import path as necessary
import auth from "../api/routes/auth.js"; // Adjust the import path as necessary
const router = express.Router();
router.use("/", home);
router.use("/user/", auth);
export default router;
