import Express from "express";
import authController from "./auth.controller.js";
import authentication from "../../../middleware/authentication.js";
import authorization from "../../../middleware/authorization.js";
export default Express.Router()
	.post("/login", authController.login)
	.get("/sso", authentication.sso, authController.sso)
	.get(
		"/create-session",
		authentication.authenticate,
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		authController.createSession,
	)
	.get(
		"/session-status/:sessionId",
		authentication.authenticate,
		authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"),
		authController.authenticateSessionStatus,
	)
	.post("/login-with-qrcode/:sessionId", authController.loginWithQRCode)

	/**
	 * Admin work as super admin
	 * admin proxy login
	 * admin exit proxy
	 */

	.post("/proxy-login", authentication.authenticate, authorization("ADMIN"), authController.proxyLogin)
	.post("/proxy-logout", authentication.authenticate, authorization("ADMIN", "BUHR", "HR_OPS", "SUPERADMIN", "USER"), authController.proxyLogin)
