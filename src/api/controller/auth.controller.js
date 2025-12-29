
import {authenticateUser} from "../services/authService.js";
import bcrypt from "bcryptjs";
import validator from "../../helper/validator.js";
import db from "../../config/db.config.js";
import helper from "../../helper/helper.js";
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
				title: `Blog:  SEO Portal`,
				description: `Read about in detail.`,
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
		async forgotPassword(req, res) {
		try {
				let formError={};
				let formData={};
			  res.render('forgot-password', {
				title: `Forgot Password`,
				description: `Forgot Password`,
					formError,
					formData,
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
			console.log("data",data)
			const { email, password } = data;
			const user = await authenticateUser(email);
			if(!user){
				req.flash('message', JSON.stringify({ type: 'error', text: 'Account does not exist' }));
				return res.redirect('/user/login');
			}
			if(user.is_active==0){
				req.flash('message', JSON.stringify({ type: 'error', text: 'Your Account has been deactivated ,Please connect with customer support' }));
				return res.redirect('/user/login');
			}

			const comparePass = await bcrypt.compare(
					password,
					user.password,
			);
			if (!comparePass) {
				req.flash('message', JSON.stringify({ type: 'error', text: 'Email/Password Does not macth' }));
				return res.redirect('/user/login');
			}
			
			// Set session
			req.session.user = {
			id: user.id,
			name: user.name
			}; 

			// const hashedPassword = await helper.encryptPassword(result.password);
			req.flash('message', JSON.stringify({ type: 'success', text: 'Login successfully done' }));
			return res.redirect('/');
			

		} catch (error) {
			console.log(error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));
			return res.redirect('/user/login');
			
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

	async accountRecovery(req, res){
try{
				let formError={};
				let formData={};
			
						const { error, value } = validator.forgotPassword.validate(req.body, {
						abortEarly: false // 🔥 saare errors ek sath
						});
						if (error) {
						let errors={}
						error.details.forEach(err => {
						errors[err.path[0]] = err.message;
						});
						formError=errors;
						formData=value;

					res.render('forgot-password', {
					title: `Forgot Password`,
					description: `Forgot Password`,
					formError,
					formData,
					});
					}



				let userData=await db.user.findOne({
				where: {
				email:value.email,
				is_active:1
				}
				}
				);
			if(!userData){
			req.flash('message', JSON.stringify({ type: 'success', text: 'OTP sent to your email for verification' }));
			}
			req.session.userEmail = value.email;
			return res.redirect('/user/otp-verification');
		}
		catch (error) {
			console.log(error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));
			return res.redirect('/user/forgot-password');
		}
				

	}
	async otpVerification(req, res) {
		try {
			let email=res.locals.userEmail;
			let formError={};
			let formData={};
			res.render('otp-verification', {
			title: `Otp verification`,
			description: `Otp verification`,
			formError,
			formData,
			});
		}
		catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
		async passwordUpdate(req, res){
try{
					let email=res.locals.userEmail;
					let formError={};
					let formData={};
			
						const { error, value } = validator.passwordUpdate.validate(req.body, {
						abortEarly: false // 🔥 saare errors ek sath
						});
						if (error) {
						let errors={}
						error.details.forEach(err => {
						errors[err.path[0]] = err.message;
						});
						formError=errors;
						formData=value;

					res.render('otp-verification', {
					title: `Otp verification`,
					description: `Otp verification`,
					formError,
					formData,
					});
					}

			let userData=await db.user.findOne({
			where: {
			email:email
			}
			}
			);
			if(!userData){
			req.flash('message', JSON.stringify({ type: 'error', text: 'User not found' }));
			}

			if(userData.otp!=value.otp){
			 req.flash('message', JSON.stringify({ type: 'success', text: 'OTP did not matched' }));
			 return res.redirect('/user/otp-verification');	
			}
			const hashedPassword = await helper.encryptPassword(value.password);
			await db.user.update(
			{
			password:hashedPassword
			},
			{
			where: {
			email:email
			}
			}
			);
		req.flash('message', JSON.stringify({ type: 'success', text: 'Password Updated Successfully' }));
		return res.redirect('/user/login');

			
		}
		catch (error) {
			console.log(error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));
			return res.redirect('/user/forgot-password');
		}
				

	}
}

export default new AuthController();
