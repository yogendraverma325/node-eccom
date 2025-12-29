import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import {returnCartList} from "../services/cartService.js";
import { getCategories } from "../services/home.service.js";
import { Op, fn, col, where} from 'sequelize';
import validator from "../../helper/validator.js";
import {getState,getCity,getPincodes,businessLogic} from "../services/centralService.js"
import bcrypt from "bcryptjs";
class HomeController {
	async home(req, res) {
		try {
					
			        const categories = await getCategories(0,6)
					
					const hotProducts = await db.productSectionMapping.findAll({
						order: [["createdAt", "DESC"]],
						limit: 10,
						include: [
							{
								model: db.product,
								as: "sectionProducts",
								attributes: ["product_auto_id", "name", "image","price","offerprice","rating","description","review","slug","for_gender","gender_applicability"],
								where: {
									isActive: 1
								}
							}
						],
						where:{
							sectionId:1
						}
					});

					req.session.orderPlaced = false;
					res.render('index', {
					title: 'Home',
					description: 'This is a sample SEO-friendly home page using Node.js and EJS.',
					categories,
					hotProducts
					});

			
			
			
			
		} catch (error) {
			console.log("error",error);
		}
	}
	async  productDetails(req, res) {
		try {
			let productAutoId = req.params.id;
			let slug = req.params.slug;
		if (productAutoId) {
		productAutoId=helper.generateJwtOTPDecrypt(productAutoId);
		}
	let productDetails = await db.product.findOne({
		attributes: ["product_auto_id", "name", "image","price","offerprice","description","long_description","variant_available","for_gender","gender_applicability"],
		where: {
			product_auto_id: productAutoId,
			isActive: 1
		},
		 include: [
			{
			model: db.product_feature_mapping,
			attributes: ['feature_value']
			},
			{
			model: db.product_images,
			attributes: ['image']
			},
			{
			model: db.product_meta_data,
			attributes: ['meta_data']
			},
			{
			model: db.product_specification_mapping,
			as: 'specifications',
			where: { is_active: 1 },
			required: false,
			include: [
			{
			model: db.specification_master,
			as: 'specification',
			attributes: ['specification_name']
			}
			]
			}
	]
	});
// 	console.log(
//   "productDetails",
//   JSON.stringify(productDetails, null, 2)
// );
			res.render('productDetails', {
				title: `Blog: productDetails`,
				description: `Read about productDetails.`,
				productDetails
			  });
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async  productList(req, res) {
		try {
				const categorySlug = req.query.category || null;     // "cat-slug"
				const page = req.query.page || 1;     // "page"
				const encryptedId = req.query['category-id'] || null; // "MQ=="
				const search = (req.query.search || '').trim();
				const sort = req.query['sort'] || ''; // "MQ=="
				let order = [['createdAt', 'DESC']]; // default (Popularity / New)

				switch (sort) {
				case 'price_asc':
					order = [['price', 'ASC']];
					break;

				case 'price_desc':
					order = [['price', 'DESC']];
					break;

				case 'new':
					order = [['createdAt', 'DESC']];
					break;
				}

	
				let categoryId = null;
				let subcategoryId = null;
				let SubCategoryList=[];
				let wholeCategory =[] ;
				if (encryptedId) {
					categoryId=helper.generateJwtOTPDecrypt(encryptedId);
					SubCategoryList=await getCategories(categoryId,0);
						wholeCategory = [
						categoryId,
						...SubCategoryList.map(c => c.catAutoId),
						];
				}
				const limit=20;
                const offset = (page - 1) * limit;

	const productWhere = {
	isActive: 1
	};

	if (search && search.trim() !== '') {
      const words = search
        .trim()
        .toLowerCase()
        .split(/\s+/); // ["power", "sound", "bar"]

    productWhere[Op.and] = words.map(word =>
        where(
            fn('LOWER', col('product.name')),
            { [Op.like]: `%${word}%` }
        )
    );
}
			
const products = await db.product.findAndCountAll({
    where: productWhere,
    include: [{
        model: db.productcategorymappings,
        as: 'mappings',
        required: true, 
        where: {
			is_active: 1,
			...(wholeCategory.length > 0 && {
			category_id: {
			[Op.in]: wholeCategory
			}
			})
            }
    }],
    // Pagination Flags
    limit: limit > 0 ? parseInt(limit) : null,
    offset: offset > 0 ? parseInt(offset) : 0,
    subQuery: false, // <--- YE SABSE ZAROORI HAI
    distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
    order: order
});
		
				const totalRecords = products.count;
				const totalPages = Math.ceil(totalRecords / limit);
			res.render('productList', {
				title: `productList`,
				description: `${categorySlug}'s Product List`,
				categoryId,
				categorySlug,
				subcategoryId,
				SubCategoryList,
				products,
				totalPages,
				page,
				sort,
			  });
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async  cart(req, res) {
		try {
			const userCart = req.cookies.userCart;
				let Subtotal=0;
				let shipping=0;
				let youSaveTotal=0;
				let grandTotal=0;

			let cartList=[]
			if (cartList) {
			  try {
				  cartList = await returnCartList(userCart);
			  } catch (error) {
			  }
			}
			Subtotal = helper.cartSubtotal(cartList);
			shipping = await helper.shippingTotal(Subtotal);
			youSaveTotal = await helper.youSaveTotal(cartList);
			grandTotal=Subtotal+shipping;
			res.render('cart', {
				title: `Blog:cart`,
				description: `Read about cart.`,
				cartList,
				helper,
				Subtotal,
				shipping,
				youSaveTotal,
				grandTotal
			  });
		} catch (error) {
	
		}
	}
	async  addToCart(req, res) {
		try {
			console.log("req.body",req.body);
			let  {productAutoId}  = req.body;
			let  qty  = req.body.qty || 1;
			if (productAutoId) {
			productAutoId=helper.generateJwtOTPDecrypt(productAutoId);
			}
			const userCart = req.cookies.userCart;
			if (productAutoId!='') {
					let isAlreadyInCart = await db.cart.findOne({
					where: {
						userCookie: userCart,
						product_auto_id: productAutoId
					}
					});
					if(!isAlreadyInCart){
						await db.cart.create({
							userCookie: userCart,
							product_auto_id: productAutoId,
							qty: qty
						});
					}
			 req.flash('message', JSON.stringify({ type: 'success', text: 'Item added into the cart' }));	
			 
			}else{
			req.flash('message', JSON.stringify({ type: 'error', text: 'Item is not available' }));	
			}
			 res.redirect('/cart'); // back to the same page
		} catch (error) {
	       req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
		}
	}
	async  removeFromCart(req, res) {
		try {
			let  {productAutoId}  = req.body;
			if (productAutoId) {
			productAutoId=helper.generateJwtOTPDecrypt(productAutoId);
			}
			const userCart = req.cookies.userCart;
		if (productAutoId!='') {
			await db.cart.destroy({
				where: {
					userCookie: userCart,
					product_auto_id: productAutoId
				}
				});
			  req.flash('message', JSON.stringify({ type: 'success', text: 'Item Removed from the cart' }));	
			}
			res.redirect('back'); // back to the previous page
		} catch (error) {
	 req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
		}
	}
	async  checkout(req, res) {
		try {
		if (req.session.orderPlaced) {
		return res.redirect('/');
		}
			const userCart = req.cookies.userCart;
			let cartList=[];
			let states=[];
			  try {
					cartList = await returnCartList(userCart);
					states = await getState();
					
			  } catch (error) {

			  }
			 
			
				if(cartList.length==0){
				 res.redirect('/'); // back to the previous page
				}
		let formError = {};
		let formData = {};
		let Subtotal=0;
		let shipping=0;
		let youSaveTotal=0;
		let grandTotal=0;
		let discount=0;

		Subtotal = helper.cartSubtotal(cartList);
		shipping = await helper.shippingTotal(Subtotal);
		youSaveTotal = await helper.youSaveTotal(cartList);
		grandTotal=Subtotal+shipping-discount;
		res.render('checkout', {
		title: `Checkout`,
		description: `Read about cart.`,
		cartList,
		formError,
		formData,
		states,
		Subtotal,
		shipping,
		youSaveTotal,
		grandTotal,
		discount
		});
			
		} catch (error) {
			console.log("error",error)
		req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
		res.redirect('/checkout'); 
		}
	}

	async checkoutProcess(req, res){
	try {
		const userCart = req.cookies.userCart;
		let cartList= await returnCartList(userCart);
		let states = await getState();
		if(cartList.length==0){
		req.flash('message', JSON.stringify({ type: 'error', text: 'Cart is empty' }));	
		res.redirect('/cart'); 
		}
		let formError = {};
		let formData = {};

		let Subtotal=0;
		let shipping=0;
		let youSaveTotal=0;
		let grandTotal=0;
		let discount=0;

		Subtotal = helper.cartSubtotal(cartList);
		shipping = await helper.shippingTotal(Subtotal);
		youSaveTotal = await helper.youSaveTotal(cartList);

		const { error, value } = validator.checkoutSchema.validate(req.body, {
				abortEarly: false // 🔥 saare errors ek sath
				});
				if (error) {
				let errors={}
				error.details.forEach(err => {
				errors[err.path[0]] = err.message;
				});
				formError=errors;
				formData=value;

				return res.render("checkout", {
					title: `Checkout`,
					description: `Read about cart.`,
					cartList,
					formError,
					formData,
					states,
					Subtotal,
					shipping,
					youSaveTotal,
					grandTotal,
					discount
					});
			}
let checkoutData=value;
			let dataFromCoupon=helper.applyCouponCode(value.coupon,Subtotal,shipping)
			discount=dataFromCoupon.discount;
			grandTotal=dataFromCoupon.grandTotal;

			// checkout process start
			let orderCount=await db.orders.count()+1;
			let userId=1
			let orderNumber=await helper.generateOrderNo(orderCount);
			const transaction = await db.sequelize.transaction();

	const orderData = {
		order_number: orderNumber,
		user_id: 1,
		subtotal:Subtotal,
		discount_amount: discount,
		shipping_amount: shipping,
		grand_total:grandTotal,
		coupon_code: checkoutData.coupon,
		payment_method:checkoutData.shipping,      // POD / Online
		payment_status: 'pending',    // pending / paid / failed
		order_status:'pending',     // placed / shipped / delivered / cancelled,
		createdBy:userId
	};

   const order = await db.orders.create(orderData,{ transaction });
   await db.order_shipping.create({
    order_id: order.order_id,
    full_name: checkoutData.first_name+' '+checkoutData.last_name,
    mobile:checkoutData.mobile,
    address: checkoutData.address,
    landmark: checkoutData.landmark,
    state: checkoutData.state,
    city: checkoutData.city,
    pincode: checkoutData.pincode,
    createdBy: userId,
  }, { transaction });

  const orderItemsData = cartList.map(item => ({
	order_id: order.order_id,
	product_auto_id: item.product_auto_id,
	qty: item.qty,
	price: item.cartProducts.price ,
	offerprice: item.cartProducts.offerprice ,
	item_total: item.qty *  item.cartProducts.price,
	item_status: 'active',
	createdBy: userId
}));
	await db.order_items.bulkCreate(orderItemsData, {
	transaction
	});
if(checkoutData.shipping=='POD'){
	await db.orders.update(
  {
    order_status: 'confirmed',
    payment_status: 'pending' // optional
  },
  {
    where: {
      order_id: order.order_id
    },
    transaction
  }
);
		await db.cart.destroy({ // destroy cart
		where: {
			userCookie: userCart
		}
		});
	await transaction.commit();
	req.session.orderPlaced = true;
	req.flash('message', JSON.stringify({ type: 'success', text: 'Order has been Placed' }));	
	res.redirect('/'); 
}

	}
	catch (error) {
		//    await transaction.rollback();
		console.log("error",error)
		req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
		res.redirect('/checkout'); 
	}
	}

	async  contact(req, res) {
		try {
			if (req.method === 'GET') {
				res.render('contact', {
				title: `Contact us`,
				description: `Contact us.`
			  });
			}
			 if (req.method === 'POST') {
				const { name, subject, email,phone,message } = req.body;
				console.log("req.body",req.body);
				req.flash('message', JSON.stringify({ type: 'success', text: 'We will connect with you soon' }));	
				res.redirect('/contact'); // back to the previous page
			 }
			
		} catch (error) {
	         res.redirect('/'); // back to the previous page
		}
	}
	async  aboutUs(req, res) {
		try {
			res.render('aboutUs', {
				title: `About us`,
				description: `About us.`
			  });
		} catch (error) {
	  res.redirect('/'); // back to the previous page
		}
	}
	async  applyCoupon(req, res) {
		try {
			const userCart = req.cookies.userCart;
			let cartList=[];
			cartList = await returnCartList(userCart);
			let Subtotal = helper.cartSubtotal(cartList);
			let shipping = await helper.shippingTotal(Subtotal);
			let dataFromCoupon=helper.applyCouponCode(req.body.couponCode,Subtotal,shipping)
			let discount=dataFromCoupon.discount;
			let grandTotal=dataFromCoupon.grandTotal
			//console.log("body",req.body.couponCode)
			return respHelper(res, {
				status: 200,
				data: {discount:discount,finalTotal:grandTotal},
				msg:"Coupon Applied Successfully",
			});
			
		} catch (error) {
			console.log("error",error)
			return respHelper(res, {
			status: 500,
			data: {discount:0},
			msg:"Coupon did't worked",
			});
		}
	}

async  city_list (req, res){
	try {
			let stateId=req.query.stateId;
			let cities = await getCity(stateId);
		return respHelper(res, {
		status: 200,
		data:cities,
		msg:"City List Returned",
		});
	
} catch (error) {
	return respHelper(res, {
	status: 500,
	data: [],
	msg:"List not found",
	});
}

}
async  pincodeList (req, res){
	try {
		let cityId=req.query.cityId;
		console.log("body",cityId)
		let picodes = await getPincodes(cityId);
		return respHelper(res, {
		status: 200,
		data:picodes,
		msg:"Pincode List Returned",
		});
	
} catch (error) {
	console.log("error",error)
	return respHelper(res, {
	status: 500,
	data: [],
	msg:"List not found",
	});
}

}
async account(req, res){
	  const orders = await db.orders.findAll({});
	res.render('account/layout', {
		title: `Accont`,
		description: `Accont`,
		active: 'orders',
        // 👇 inner page path
        page: 'order.ejs',
        // 👇 inner page data
        pageData: {
            orders
        }
    });
}
async changePassword(req, res){
	let formError={};
			let formData={}
	res.render('account/layout', {
		title: `Accont`,
		description: `Accont`,
		active: 'changePassword',
        // 👇 inner page path
        page: 'changePassword.ejs',
        // 👇 inner page data
        pageData: {
			formError,
			formData
        }
    });
}
async addressBook(req, res){
let addresses={};
	res.render('account/layout', {
		title: `Accont`,
		description: `Accont`,
		active: 'addressbook',
        // 👇 inner page path
        page: 'address-book.ejs',
        // 👇 inner page data
        pageData: {
            addresses
        }
    });
}
async orderDetails(req, res){
		let encryptedId = req.params.orderid || null; // "MQ=="
		if(!encryptedId){
			res.redirect('/account'); 
		}
	let orderId=null;
	if (encryptedId) {
			orderId=helper.generateJwtOTPDecrypt(encryptedId);
	}
	const orderDetails = await db.orders.findOne({where:{
	order_id:orderId
	}});
	const ordeerItmes = await db.order_items.findAll({where:{
	order_id:orderId
	}});
	console.log(JSON.stringify(ordeerItmes,null,2))
	res.render('account/layout', {
		title: `Order Details`,
		description: `Order Details`,
		active: 'orders',
        // 👇 inner page path
        page: 'order-details.ejs',
        // 👇 inner page data
        pageData: {
			orderDetails,
			ordeerItmes
        }
    });
	console.log("orderId",orderId)

}
async orderTimeline(req, res){
let encryptedId = req.params.orderid || null; // "MQ=="
		if(!encryptedId){
			res.redirect('/account'); 
		}
	console.log("encryptedId",encryptedId)
	let orderId=null;
	if (encryptedId) {
			orderId=helper.generateJwtOTPDecrypt(encryptedId);
	}
	let addresses={};
	res.render('account/layout', {
		title: `Order Timeline`,
		description: `Order Timeline`,
		active: 'orders',
        // 👇 inner page path
        page: 'ordertimeline.ejs',
        // 👇 inner page data
        pageData: {
            addresses
        }
    });
}
	async updatePaassord(req, res) {
		try {
			let formError={};
			let formData={}
				const { error, value } = validator.changePasswordSchema.validate(req.body, {
				abortEarly: false // 🔥 saare errors ek sath
				});
				if (error) {
				let errors={}
				error.details.forEach(err => {
				errors[err.path[0]] = err.message;
				});
				formError=errors;
				formData=value;


			res.render('account/layout', {
				title: `Accont`,
				description: `Accont`,
				active: 'changePassword',
				// 👇 inner page path
				page: 'changePassword.ejs',
				// 👇 inner page data
				pageData: {
					formError,
					formData,
				}
			});
			}
			let userData=await db.user.findOne({
			where: {
			userId:1
			}
			}
			);

		const comparePass = await bcrypt.compare(
				value.new_password,
				userData.password,
		);
		if (!comparePass) {
		req.flash('message', JSON.stringify({ type: 'error', text: 'Current Password Does not matched' }));
		return res.redirect('/change-passord');
		}
	const hashedPassword = await helper.encryptPassword(value.new_password);
		await db.user.update(
		{
		password:hashedPassword
		},
		{
		where: {
		userId:1
		}
		}
		);
			req.flash('message', JSON.stringify({ type: 'success', text: 'Password Updated Successfully' }));
			return res.redirect('/change-passord');
			

		} catch (error) {
			console.log(error);
			req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));
			return res.redirect('/change-passord');
		}
	}
}

export default new HomeController();
