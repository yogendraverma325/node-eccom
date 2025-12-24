import Express from "express";
import HomeController from "../controller/home.controller.js";


export default Express.Router()
	.get("/",HomeController.home)
	.get("/product-details/:id/:slug", HomeController.productDetails) 
	.get("/products",HomeController.productList)
	.get("/cart",HomeController.cart)
	.post("/addToCart",HomeController.addToCart)
	.post("/removeFromCart",HomeController.removeFromCart)
	.get("/checkout",HomeController.checkout)
	.get("/contact",HomeController.contact)
	.post("/contact",HomeController.contact)
	.get("/about-us",HomeController.aboutUs)
	.post("/apply-coupon",HomeController.applyCoupon)
	.post("/checkout",HomeController.checkoutProcess)
	.get("/get-cities",HomeController.city_list)
	.get("/get-pincodes",HomeController.pincodeList)
	.get("/account",HomeController.account)
	.get("/address-book",HomeController.addressBook)
	.get("/changes-passord",HomeController.changePassword)
	.get("/order-details/:orderid",HomeController.orderDetails)
	.get("/order-timeline/:orderid",HomeController.orderTimeline);
	
