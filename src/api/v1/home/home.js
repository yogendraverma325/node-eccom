import Express from "express";
import HomeController from "./home.controller.js";

export default Express.Router()
	.get("/",HomeController.home)
	.get("/login",HomeController.login)
	.post("/login",HomeController.logInFunction)
	.post("/logout",HomeController.logout);
