import Express from "express";
import AuthController from "../controller/auth.controller.js";
export default Express.Router()
	.get("/login",AuthController.login)
	.post("/login",AuthController.logInFunction)
	.get("/logout",AuthController.logout)
