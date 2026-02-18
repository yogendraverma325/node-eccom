/* eslint-disable no-undef */
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import moment from "moment";
import db from "../config/db.config.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import eventEmitter from "../api/services/eventService.js";
import crypto from "crypto";
import axios from "axios";
import https from "https";
import pushNotificationEmitter from "../services/pushNotificationEventService.js"; // New
import { businessLogic } from "../api/services/centralService.js";
// import { createCanvas, loadImage } from "canvas";
import nodemailer from 'nodemailer';
const CONTACT = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // SSL ke liye true
    auth: {
        user: 'contact@localtravelstay.com', // .env se lein
        pass: 'Yogiv@051995'        // .env se lein
    }
});
const INFO = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // SSL ke liye true
    auth: {
        user: 'info@localtravelstay.com', // .env se lein
        pass: 'Yogiv@051995'        // .env se lein
    }
});
const generateJwtOTPEncrypt =  (data) => {
	const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return Buffer.from(stringData).toString('base64');
};

const generateJwtOTPDecrypt = (encodedData) => {
	const decoded = Buffer.from(encodedData, 'base64').toString('utf8');
    try {
        // Agar data JSON format mein tha, to wapas object bana dein
        return JSON.parse(decoded);
    } catch (e) {
        return decoded;
    }
};

const fileUpload = async (base64String, fileName, filepath) => {
	checkFolder();
	let dir = filepath;
	if (!dir) dir = path.resolve(dir);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	const fileExt = base64String.slice(
		base64String.indexOf("/") + 1,
		base64String.indexOf(";"),
	);

	const base64Data = base64String.replace(/^data:(.+);base64,/, "");
	const buffer = Buffer.from(base64Data, "base64");
	const finalFilePath = `${dir}/${fileName}.${fileExt}`;

	// if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
	//   sharp(buffer).resize(300, 300)
	//     .toFormat('jpeg')
	//     .jpeg({ quality: 80 })
	//     .toFile(finalFilePath);
	// } else {
	fs.writeFileSync(finalFilePath, buffer);
	// }
	return finalFilePath;
};
const savePdfFile = (buffer, fileName, folderPath) => {
	// Ensure directory exists
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	const filePath = path.join(folderPath, fileName);

	// Write the PDF buffer to file
	fs.writeFileSync(filePath, buffer);

	return filePath;
};

const checkFolder = async () => {
	const folder = ["uploads", "uploads/temp", "config"];
	for (const iterator of folder) {
		let dir = iterator;
		if (!dir) dir = path.resolve(iterator);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
	}
};



const mailService = async (data) => {
	try {
		const testMail = parseInt(process.env.TEST_MAIL);
		const testMailIDs = process.env.TEST_MAIL_ID.split(",");
		const mailOptions = {
        from: data.mode=='CONTACT' ? 'contact@localtravelstay.com' : 'info@localtravelstay.com',
        to: testMail ? testMailIDs : data.to.split(","),
        subject:  data.subject,
        html: `${data.html}`
    };
	let info=null;
		if( data.mode=='CONTACT'){
		   info = await CONTACT.sendMail(mailOptions);
		}else{
		  info = await INFO.sendMail(mailOptions);
		}
		console.log('Email sent successfully:', info.messageId);
		return info;;
	
	} catch (error) {
		console.log(error);
	}
};


const encryptPassword = async (data) => {
	const salt = await bcrypt.genSalt(10);
	const hashPassword = await bcrypt.hash(data, salt);
	return hashPassword;
};


//custom portal
const getLoggedinUser = (req) => {
	if (req.session.user) return req.session.user;
	return null;
  };
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};
const ratingAndReview = (rating) => {
	let stars = '';
  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars += '<li><i class="lni lni-star-filled"></i></li>';
    } else {
      stars += '<li><i class="lni lni-star"></i></li>';
    }
  }
  return stars;
  };
  const service_scope_type = (input) => {
	let out = '';
	switch (input) {
		case 'PRICE':
          out='₹';
		break;
		case 'TIME':
		out='<i class="lni lni-timer"></i>';
		break;

	}
  return out;
  };
  const discountOnProduct = (product) => {
		let discount=0;
		return discount;
  };
  const cartSubtotal =  (cartList) => {
	let total=cartList.reduce((acc, item) => {
		return acc + (item.cartProducts.price * item.qty);
	}, 0);
	return total;
};
const cartGrandtotal = (cartList) => {
	let total=0;
	let subtotal =  cartSubtotal(cartList);
	return total = subtotal +  shippingTotal(cartList) -  youSaveTotal(cartList);
};
const shippingTotal = async (subTotalAmount) => { 
	let storeInfo=await businessLogic('SHIPPING_DETAILS');
	let SHIPPING_FEE=getValueFromKey(storeInfo,'SHIPPING_FEE');
	let MIN_CART_VALUE=getValueFromKey(storeInfo,'MIN_CART_VALUE')
	let total=0;
	if(MIN_CART_VALUE>subTotalAmount){
		total=SHIPPING_FEE;
	}
	return total;
};
const youSaveTotal =  (cartList) => {
	let totalSavings = 0;
	cartList.forEach(item => {
	const price = (item.cartProducts.price || 0);
	const offerPrice = (item.cartProducts.offerprice || 0);
	const qty = (item.qty || 1);

	if (offerPrice > 0 && offerPrice > price) {
	totalSavings += (offerPrice - price) * qty;
	}
	});
	return totalSavings;
}; 

const getValueFromKey=(INPUT_ARRAY,INPUT_KEY)=>{
	let object=INPUT_ARRAY.find(el=>el.key==INPUT_KEY);
	let value=''
	if(object){
		switch (object.value_type) {
			case 'NUMBER':
			value= parseInt(object.value)
			break;

			case 'STRING':
				value= object.value;
			break;

			case 'DOUBLE':
			value= parseFloat(object.value);
		}

	}
	return value;
}
// custom portal

const  generateOrderNo=(id)=> {
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  return `ORD-${date}-${String(id).padStart(8,'0')}`;
}
const  applyCouponCode=(couponCode,Subtotal,shipping)=> {
	let discount=(Subtotal/100)%5;
	let grandTotal=Subtotal+shipping-discount;
	return {discount,grandTotal}
}

const dateToReadAbleFormat=(date)=>{
return moment(date).format("dddd, MMMM Do YYYY, h:mm:ss A")
}
const timelineCreation=async (transaction,data)=>{
	await db.order_status_timeline.create({
			order_id:data.order_id,
			status:data.status,
			remark:data.remark,
			createdBy:data.createdBy,
			reason:data.reason
	}, { transaction} );
}
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")   // special chars remove
    .replace(/\s+/g, "-")           // spaces → hyphen
    .replace(/-+/g, "-");           // multiple - → single
}; 
export default {
	getLoggedinUser,
	checkFolder,
	isAuthenticated,
	ratingAndReview,
	service_scope_type,
	discountOnProduct,
	cartSubtotal,
	cartGrandtotal,
	shippingTotal,
	youSaveTotal,
	getValueFromKey,
	generateJwtOTPDecrypt,
	generateJwtOTPEncrypt,
	generateOrderNo,
	applyCouponCode,
	dateToReadAbleFormat,
	encryptPassword,
	timelineCreation,
	mailService,
	generateSlug
};
