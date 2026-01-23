
import {authenticateUser} from "../services/authService.js";
import bcrypt from "bcryptjs";
import validator from "../../helper/validator.js";
import db from "../../config/db.config.js";
import helper from "../../helper/helper.js";
import respHelper from "../../helper/respHelper.js";
import moment from 'moment';
import eventEmitter from "../services/eventService.js";
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
			if(user.is_verified==0){
				req.flash('message', JSON.stringify({ type: 'error', text: 'Your Account is not verfied, Please verify to proceed' }));
				req.session.userEmail = user.email;
				return res.redirect('/user/singupverification');
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
			id: user.userId,
			name: user.name,
			email: user.email
			}; 
			await db.user.update(
			{
			last_login:moment()
			},
			{
			where: {
			email:user.email
			}
			}
			);

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
			req.flash('message', JSON.stringify({ type: 'error', text: 'Account does not exist' }));
			return res.redirect('/user/forgot-password');
			}
			req.session.userEmail = value.email;
			let email=value.email;
			const today = moment().startOf('day'); // 00:00:00 today
			const otpDate = userData.otp_date ? moment(userData.otp_date).startOf('day') : null;

			// 3. OTP count check
			if (otpDate && otpDate.isSame(today, 'day') && userData.otp_count_of_the_date >= 3) {
			req.flash('message', JSON.stringify({ type: 'error', text: 'You can only request 3 OTPs per day' }));
			return res.redirect('/user/forgot-password');
			}
			 const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
			eventEmitter.emit(
			"OTP",
			JSON.stringify({
			email,
			newOtp,
			userData
			}),
			);
			  await db.user.update(
            {
                otp: newOtp,
                otp_date: today.toDate(),
                otp_count_of_the_date: otpDate && otpDate.isSame(today, 'day') 
                                        ? userData.otp_count_of_the_date + 1 
                                        : 1
            },
            { where: { email:email } }
        );
		req.flash('message', JSON.stringify({ type: 'success', text: 'OTP sent to your email for verification' }));
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
					console.log("email",email)
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

					return res.render('otp-verification', {
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
			 return res.redirect('/user/otp-verification');
			}

			if(userData.otp!=value.otp){
			 req.flash('message', JSON.stringify({ type: 'error', text: 'OTP did not matched' }));
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
	async resendOTP(req, res){
		try{
				let email=res.locals.userEmail;
				console.log("email",email)
			let userData=await db.user.findOne({
				where: {
				email:email,
				is_active:1
				}
				}
				);
				 if (!userData) {
				return respHelper(res, {
				status: 400,
				data: {},
				msg:"Account not found",
				});
				 }
		const today = moment().startOf('day'); // 00:00:00 today
		const otpDate = userData.otp_date ? moment(userData.otp_date).startOf('day') : null;

        // 3. OTP count check
        if (otpDate && otpDate.isSame(today, 'day') && userData.otp_count_of_the_date >= 3) {
			return respHelper(res, {
				status: 400,
				data: {},
				msg:"You can only request 3 OTPs per day",
				});
        }

        // 4. OTP generate
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

        // 5. Update user table
        await db.user.update(
            {
                otp: newOtp,
                otp_date: today.toDate(),
                otp_count_of_the_date: otpDate && otpDate.isSame(today, 'day') 
                                        ? userData.otp_count_of_the_date + 1 
                                        : 1
            },
            { where: { email:email } }
        );

				eventEmitter.emit(
				"OTP",
				JSON.stringify({
					email,
					newOtp,
					userData
				}),
				);
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"OTP generated Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
	async signUp(req, res) {
		  const transaction = await db.sequelize.transaction();
		try {
			 
			
						 let AdminId=100;
					
				let formError = {};
				let formData = {};
			  
			if (req.method === 'GET') {
			return res.render('signup', {
			title: `Sign up`,
			description: `Create your account`,
			formError,
			formData
			});
			}
					const { error, value } = validator.signUpSchema.validate(req.body, {
					abortEarly: false // 🔥 saare errors ek sath
					});
						if (error) {
						let errors={}
						error.details.forEach(err => {
						errors[err.path[0]] = err.message;
						});
						formError=errors;
						formData=value;
			
					return res.render('signUp', {
					title: `signUp`,
					description: `signUp`,
					formError,
					formData
					});
						}
					const existingUser= await db.user.findOne({
					where: {
					[db.Sequelize.Op.or]: [
					{ phone: value.phone },
					{ email: value.email }
					]
					}
					});
					if(existingUser){
						req.flash('message', JSON.stringify({ type: 'error', text: 'Phone Or email already exists' }));	
						res.redirect('/user/signup');
					}
				const hashedPassword = await helper.encryptPassword(value.password);
				const today = moment().startOf('day'); // 00:00:00 today
				const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP


					let userData= await  db.user.create({
									name:value.name,
									phone:value.phone,
									email:value.email,
									password:hashedPassword,
									otp:newOtp,
									otp_count_of_the_date:1,
									otp_date: today.toDate()
								},transaction);
					
										
					await transaction.commit();
					let email=value.email;
					eventEmitter.emit(
				"OTP",
				JSON.stringify({
					email,
					newOtp,
					userData
				}),
				);
				    req.session.userEmail =email;
					req.flash('message', JSON.stringify({ type: 'success', text: `Account has been created` }));
					res.redirect('/user/singupverification'); // back to the previous page
					console.log("value",value)
		}
		catch (error) {
			await transaction.rollback();
			console.log("error",error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
			res.redirect('/user/signup');
		}
	}
	
async singupverification(req, res) {
	  const transaction = await db.sequelize.transaction();
		try {
			 
			let email=res.locals.userEmail;
			let formError={};
			let formData={};
			if (req.method === 'GET') {
                   return res.render('signup-verification', {
			title: `Otp verification`,
			description: `Otp verification`,
			formError,
			formData,
			});
			}

			const { error, value } = validator.signUpOTP.validate(req.body, {
						abortEarly: false // 🔥 saare errors ek sath
						});
						if (error) {
						let errors={}
						error.details.forEach(err => {
						errors[err.path[0]] = err.message;
						});
						formError=errors;
						formData=value;

					  return res.render('signup-verification', {
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
			 return res.redirect('/user/singupverification');	
			}
			if(userData.otp!=value.otp){
			 req.flash('message', JSON.stringify({ type: 'error', text: 'OTP did not matched' }));
			 return res.redirect('/user/singupverification');	
			}
			await db.user.update(
			{
			is_verified:1
			},
			{
			where: {
			email:email
			}
			}
			);
			 await transaction.commit();
		req.flash('message', JSON.stringify({ type: 'success', text: 'Account has been activated' }));
		return res.redirect('/user/login');
     
			
		}
		catch (error) {
		 await transaction.rollback();
			console.log("error",error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
			res.redirect('/user/signup');
		}
	}
}

export default new AuthController();
