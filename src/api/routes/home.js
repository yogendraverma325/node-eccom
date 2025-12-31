import Express from "express";
import HomeController from "../controller/home.controller.js";
import { isLogin } from "../../middleware/authentication.js";


export default Express.Router()
	.get("/",HomeController.home)
	.get("/product-details/:id/:slug", HomeController.productDetails) 
	.get("/products",HomeController.productList)
	.get("/cart",HomeController.cart)
	.post("/addToCart",HomeController.addToCart)
	.post("/removeFromCart",HomeController.removeFromCart)
	.get("/contact",HomeController.contact)
	.post("/contact",HomeController.contact)
	.get("/about-us",HomeController.aboutUs)


	.get("/checkout",HomeController.checkout)
	.post("/apply-coupon",HomeController.applyCoupon)
	.post("/checkout",HomeController.checkoutProcess)
	.get("/get-cities",HomeController.city_list)
	.get("/get-pincodes",HomeController.pincodeList)
	.get("/account",HomeController.account)
	.get("/address-book",HomeController.addressBook)
	.get("/change-passord",HomeController.changePassword)
	.post("/updatePaassord",HomeController.updatePaassord)
	.get("/order-details/:orderid",HomeController.orderDetails)
	.get("/order-timeline/:orderid",HomeController.orderTimeline)
	.post("/cancelOrder",HomeController.cancelOrder)
	
