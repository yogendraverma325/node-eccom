import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import {returnCartList} from "../services/cartService.js";
import { getCategories } from "../services/home.service.js";
import { Op } from 'sequelize';
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
								attributes: ["product_auto_id", "name", "image","price","offerprice","rating","description","review","slug"],
								where: {
									isActive: 1
								}
							}
						],
						where:{
							sectionId:1
						}
					});

					
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
		attributes: ["product_auto_id", "name", "image","price","offerprice","description"],
		where: {
			product_auto_id: productAutoId,
			isActive: 1
		}
	});
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
			
const products = await db.product.findAndCountAll({
    where: { isActive: 1 },
    include: [{
        model: db.productcategorymappings,
        as: 'mappings',
        required: true, 
        include: [{
            model: db.category,
            where: {
			isActive: 1,
			...(wholeCategory.length > 0 && {
			catAutoId: {
			[Op.in]: wholeCategory
			}
			})
            }
        }]
    }],
    // Pagination Flags
    limit: limit > 0 ? parseInt(limit) : null,
    offset: offset > 0 ? parseInt(offset) : 0,
    subQuery: false, // <--- YE SABSE ZAROORI HAI
    distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
    order: [['createdAt', 'DESC']]
});

			
				const totalRecords = products.count;
				const totalPages = Math.ceil(totalRecords / limit);
					console.log("totalPages",totalPages)
			res.render('productList', {
				title: `productList`,
				description: `${categorySlug}'s Product List`,
				categoryId,
				categorySlug,
				subcategoryId,
				SubCategoryList,
				products,
				totalPages,
				page
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
			let cartList=[]
			if (cartList) {
			  try {
				  cartList = await returnCartList(userCart);
			  } catch (error) {
			  }
			}
			res.render('cart', {
				title: `Blog:cart`,
				description: `Read about cart.`,
				cartList,
				helper
			  });
		} catch (error) {
	
		}
	}
	async  addToCart(req, res) {
		try {
			let  {productAutoId}  = req.body;
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
							qty: 1
						});
					}
			 req.flash('message', JSON.stringify({ type: 'success', text: 'Item added into the cart' }));	
			 
			}else{
			req.flash('message', JSON.stringify({ type: 'error', text: 'Item is not available' }));	
			}
			res.redirect(req.get('Referrer') || '/'); // back to the same page
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
			const userCart = req.cookies.userCart;
			let cartList=[]
			if (cartList) {
			  try {
				  cartList = await returnCartList(userCart);
			  } catch (error) {
			  }
			}
			res.render('checkout', {
				title: `Blog:cart`,
				description: `Read about cart.`,
				cartList,
				helper
			  });
		} catch (error) {
	
		}
	}

	async  contact(req, res) {
		try {
			res.render('contact', {
				title: `Contact us`,
				description: `Contact us.`
			  });
		} catch (error) {
	
		}
	}
	async  aboutUs(req, res) {
		try {
			res.render('aboutUs', {
				title: `About us`,
				description: `About us.`
			  });
		} catch (error) {
	
		}
	}
}

export default new HomeController();
