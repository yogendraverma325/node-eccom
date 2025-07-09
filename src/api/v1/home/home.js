import Express from "express";
import HomeController from "./home.controller.js";

export default Express.Router()
	.get("/",HomeController.home)
	.get("/login",HomeController.login)
	.post("/login",HomeController.logInFunction)
	.post("/logout",HomeController.logout)
	.get("/product-details/:id", HomeController.productDetails)
	.get("/product-list",HomeController.productList)
	.get("/cart",HomeController.cart)
	.post("/addToCart",HomeController.addToCart)
	.post("/removeFromCart",HomeController.removeFromCart)
	.get("/checkout",HomeController.checkout);
