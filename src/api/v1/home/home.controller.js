import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import helper from "../../../helper/helper.js";
import validator from "../../../helper/validator.js";
import { Op } from "sequelize";
import constant from "../../../constant/messages.js";
import eventEmitter from "../../../services/eventService.js";
import fs from "fs";
import moment from "moment";
import pushNotificationEmitter from "../../../services/pushNotificationEventService.js"; // New Import Sandeep
class HomeController {
	async home(req, res) {
		try {
					const user = helper.getLoggedinUser(req) || null;
					const categories = await db.category.findAll({
						
						attributes: ["catAutoId", "categoryName", "image"],
						where: {
							isActive: 1
						}
					});
					res.render('index', {
					title: 'Home',
					description: 'This is a sample SEO-friendly home page using Node.js and EJS.',
					user,
					categories
					});

			
			
			
			
		} catch (error) {
			
		}
	}
	async login(req, res) {
		try {
			const locationCookie = req.cookies.userLocation;
			let location = null;
		  
			if (locationCookie) {
			  try {
				location = JSON.parse(locationCookie); // { latitude: ..., longitude: ... }
				console.log('User location from cookie:', location);
			  } catch (error) {
				console.error('Invalid location cookie:', error.message);
			  }
			}
			  const { slug } = req.params;
			  res.render('login', {
				title: `Blog: ${slug} | SEO Portal`,
				description: `Read about ${slug} in detail.`,
				slug,
				validationError:''
			  });
		}
		catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async logInFunction(req, res) {
		try {
			const  data  = req.body;
			const USERS = [
			{ id: 1, tmc: '13675', password: 'Teams@123',name:"Yogendra" }
			];
			const user = USERS.find(
			u => u.tmc === data.tmc && u.password === data.password
			);

			if (user) {
			// Set session
			req.session.user = {
			id: user.id,
			tmc: user.tmc,
			name: user.name
			};
			return res.redirect('/');
			}
			res.render('login', {
			title: `Login`,
			description: `Read about in detail.`,
			data:slug,
			validationError: 'TMC Not Found',   // example validation message
			someOtherData: 'Additional info here'
			});

			// const { email, password } = req.body;
			// if (!email || !password) {
			// 	return respHelper(res, {
			// 		status: 400,
			// 		message: "Email and password are required",
			// 	});
			// }
			// const user = await db.user.findOne({
			// 	where: { email, password },
			// });
			// if (!user) {
			// 	return respHelper(res, {
			// 		status: 401,
			// 		message: "Invalid email or password",
			// 	});
			// }
			// req.session.user = user;
			// return respHelper(res, {
			// 	status: 200,
			// 	data: user,
			// });
		} catch (error) {
			console.log(error);
			// return respHelper(res, {
			// 	status: 500,
			// 	message: "Internal server error",
			// });
		}
	}
	async  logout(req, res) {
		try {
			req.session.destroy(err => {
				if (err) console.error(err);
			  });
			  return res.redirect('/');
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
}

export default new HomeController();
