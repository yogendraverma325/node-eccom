import Express from "express";
import HomeController from "../controller/home.controller.js";


export default Express.Router()
	.get("/",HomeController.home)
	.get("/product-details/:id", HomeController.productDetails)
	.get("/product-list",HomeController.productList)
	.get("/cart",HomeController.cart)
	.post("/addToCart",HomeController.addToCart)
	.post("/removeFromCart",HomeController.removeFromCart)
	.get("/checkout",HomeController.checkout);
