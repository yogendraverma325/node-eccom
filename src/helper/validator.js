import Joi from "joi";
import moment from "moment";



const loginSchema = Joi.object({
	tmc: Joi.string().required().label("TMC"),
	password: Joi.string().required().label("Password"),
});

const checkoutSchema = Joi.object({
  first_name: Joi.string().trim().min(2).required().messages({
    "string.empty": "First name is required"
  }),

  last_name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Last name is required"
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required"
  }),

  mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "Mobile number must be 10 digits",
    "string.empty": "Mobile number is required"
  }),

  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required"
  }),

  landmark: Joi.string().trim().required().messages({
    "string.empty": "Landmark is required"
  }),

  state: Joi.string().required().messages({
    "string.empty": "State is required"
  }),

  city: Joi.string().required().messages({
    "string.empty": "City is required"
  }),

  pincode: Joi.string().required().required().messages({
    "string.pattern.base": "Pincode must be 6 digits",
    "string.empty": "Pincode is required"
  }),

  shipping: Joi.string().valid("POD", "ONLINE").required().messages({
    "any.only": "Invalid shipping method",
    "string.empty": "Shipping method is required"
  }),

  coupon: Joi.string().allow("", null) // optional
});
const changePasswordSchema = Joi.object({
	current_password: Joi.string()
		.min(5)
		.required()
		.label("Current Password"),

	new_password: Joi.string()
		.min(5)
		.required()
		.label("New Password"),
});

const forgotPassword = Joi.object({
	email: Joi.string().required().label("email is required")
});

const passwordUpdate = Joi.object({
	otp: Joi.string()
		.min(4)
		.required()
		.label("OTP is required"),

	password: Joi.string()
		.min(5)
		.required()
		.label("Password"),
});

export default {
	loginSchema,
	checkoutSchema,
  changePasswordSchema,
  forgotPassword,
  passwordUpdate
	// end by jay
};
