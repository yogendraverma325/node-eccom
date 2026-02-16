import Express from "express";
import HomeController from "../controller/home.controller.js";
import { isLogin } from "../../middleware/authentication.js";


export default Express.Router()
	.get("/",HomeController.home)
	.get("/service-details/:id/:slug/:vendor", HomeController.productDetails) 
	.get("/QR/:QRCODEID", HomeController.QRCodeReading) 
	.get("/services",HomeController.productList)
	.get("/cart",HomeController.cart)
	.post("/addToCart",HomeController.addToCart)
	.post("/removeFromCart",HomeController.removeFromCart)
	.get("/contact",HomeController.contact)
	.post("/contact",HomeController.contact)
	.get("/about-us",HomeController.aboutUs)
	.get("/term-and-condition",HomeController.termAndCondition)
	.get("/privacy-and-policy",HomeController.privacyAndPolicy)
	.get("/checkout",isLogin,HomeController.checkout)
	.post("/apply-coupon",isLogin,HomeController.applyCoupon)
	.post("/checkout",isLogin,HomeController.checkoutProcess)
	.get("/get-cities",isLogin,HomeController.city_list)
	.get("/get-pincodes",isLogin,HomeController.pincodeList)
	.get("/account",isLogin,HomeController.account)
	.get("/address-book",isLogin,HomeController.addressBook)
	.get("/change-passord",isLogin,HomeController.changePassword)
	.post("/updatePaassord",isLogin,HomeController.updatePaassord)
	.get("/order-details/:orderid",isLogin,HomeController.orderDetails)
	.get("/order-timeline/:orderid",isLogin,HomeController.orderTimeline)
	.post("/cancelOrder",isLogin,HomeController.cancelOrder)
	
