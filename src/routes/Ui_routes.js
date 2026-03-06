import express from "express";
import home from "../api/routes/home.js"; // Adjust the import path as necessary
import auth from "../api/routes/auth.js"; // Adjust the import path as necessary
import admin from "../api/routes/admin.js"
const router = express.Router();
router.use("/admin", admin);
router.use("/user/", auth);
router.use("/", home);

export default router;
