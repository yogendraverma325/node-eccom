import Joi from "joi";
import moment from "moment";



const loginSchema = Joi.object({
	tmc: Joi.string().required().label("TMC"),
	password: Joi.string().required().label("Password"),
});

const checkoutSchema = Joi.object({
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
		.min(6)
		.required()
		.label("OTP is required"),

	password: Joi.string()
		.min(5)
		.required()
		.label("Password"),
});
const cancel_reason = Joi.object({
  cancelOrderId: Joi.string()
    .min(4)
    .required()
    .label("OTP is required"),

  cancel_reason: Joi.string()
    .required()
    .label("reson"),
  cancel_message: Joi.string()
  .required()
  .max(255)
  .label("message"),
});
 const contactUsSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required()
    .label("Name"),

  subject: Joi.string()
    .max(255)
    .required()
    .label("Subject"),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .label("Email"),

phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
"string.pattern.base": "Mobile number must be 10 digits",
"string.empty": "Mobile number is required"
}),
  message: Joi.string()
    .max(255)
    .label("Message"),
});

 const addvendorSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required()
    .label("Name"),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .label("Email"),

phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
"string.pattern.base": "Phone number must be 10 digits",
"string.empty": "Phone number is required"
}),
  address: Joi.string()
    .max(255)
    .label("address"),
});

const signUpSchema = Joi.object({
  name: Joi.string()
    .max(255)
    .required()
    .label("Name"),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .required()
    .label("Email"),

  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
  "string.pattern.base": "Phone number must be 10 digits",
  "string.empty": "Phone number is required"
  }),
  password: Joi.string()
		.min(5)
		.required()
		.label("Password"),
});
const signUpOTP = Joi.object({
	otp: Joi.string()
		.min(6)
		.required()
		.label("OTP is required"),
});
const addProductSchema = Joi.object({

    name: Joi.string()
        .max(255)
        .required()
        .label("Product Name"),

    description: Joi.string()
        .max(500)
        .allow("")
        .label("Description"),

    long_description: Joi.string()
        .allow("")
        .label("Long Description"),

    price: Joi.number()
        .precision(2)
        .required()
        .label("Price"),

    offerprice: Joi.number()
        .precision(2)
        .allow(0)
        .label("Offer Price"),

    rating: Joi.number()
        .integer()
        .min(0)
        .max(5)
        .allow(null)
        .label("Rating"),
    price_type: Joi.string()
        .required()
        .label("Price Type"),

    capacity: Joi.string()
        .allow("")
        .label("Capacity"),

    unit: Joi.string()
        .allow("")
        .label("Unit")

});
const editProductSchema = Joi.object({

    name: Joi.string()
        .max(255)
        .required()
        .label("Product Name"),

    description: Joi.string()
        .max(500)
        .allow("")
        .label("Description"),

    long_description: Joi.string()
        .allow("")
        .label("Long Description"),

    price: Joi.number()
        .precision(2)
        .required()
        .label("Price"),

    offerprice: Joi.number()
        .precision(2)
        .allow(0)
        .label("Offer Price"),

    rating: Joi.number()
        .integer()
        .min(0)
        .max(5)
        .allow(null)
        .label("Rating"),
    price_type: Joi.string()
        .required()
        .label("Price Type"),

    capacity: Joi.string()
        .allow("")
        .label("Capacity"),

    unit: Joi.string()
        .allow("")
        .label("Unit")

});
export default {
	loginSchema,
	checkoutSchema,
  changePasswordSchema,
  forgotPassword,
  passwordUpdate,
  cancel_reason,
  contactUsSchema,
  addvendorSchema,
  signUpSchema,
  signUpOTP,
  addProductSchema,
  editProductSchema
};
