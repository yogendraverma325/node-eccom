import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import validator from "../../helper/validator.js";
import { Op } from "sequelize";
import constant from "../../constant/messages.js";
import eventEmitter from "../../services/eventService.js";
import fs from "fs";
import moment from "moment";
import pushNotificationEmitter from "../../services/pushNotificationEventService.js"; // New Import Sandeep
import {authenticateUser} from "../services/authService.js";
class AuthController {
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
			const { email, password } = data;
			const user = await authenticateUser(email, password);

			if (user) {
			// Set session
			req.session.user = {
			id: user.id,
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

		} catch (error) {
			console.log(error);
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

export default new AuthController();
