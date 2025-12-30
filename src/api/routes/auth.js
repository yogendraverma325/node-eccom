import Express from "express";
import AuthController from "../controller/auth.controller.js";
export default Express.Router()
	.get("/login",AuthController.login)
	.post("/login",AuthController.logInFunction)
	.get("/logout",AuthController.logout)
	.get("/forgot-password",AuthController.forgotPassword)
	.post("/account-recovery",AuthController.accountRecovery)
	.get("/otp-verification",AuthController.otpVerification)
	.post("/password-update",AuthController.passwordUpdate)
	.post("/resendOTP",AuthController.resendOTP);
	
