import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import {returnCartList} from "../services/cartService.js";
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
					
					const hotProducts = await db.productSectionMapping.findAll({
						order: [["createdAt", "DESC"]],
						limit: 10,
						include: [
							{
								model: db.product,
								as: "sectionProducts",
								attributes: ["productAutoId", "name", "image","price","offerprice","rating","description","review"],
								where: {
									isActive: 1
								}
							}
						],
						where:{
							sectionId:1
						}
					});

					const newArrivals = await db.productSectionMapping.findAll({
						order: [["createdAt", "DESC"]],
						limit: 2,
						include: [
							{
								model: db.product,
								as: "sectionProducts",
								attributes: ["productAutoId", "name", "image","price","offerprice","rating","description","review"],
								where: {
									isActive: 1
								}
							}
						],
						where:{
							sectionId:2
						}
					});
					
					res.render('index', {
					title: 'Home',
					description: 'This is a sample SEO-friendly home page using Node.js and EJS.',
					user,
					categories,
					hotProducts,
					newArrivals,
					helper
					});

			
			
			
			
		} catch (error) {
			console.log("error",error);
		}
	}
	async  productDetails(req, res) {
		try {
let productAutoId = req.params.id;
	let productDetails = await db.product.findOne({
		attributes: ["productAutoId", "name", "image","price","offerprice","description"],
		where: {
			productAutoId: productAutoId,
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
			res.render('productList', {
				title: `Blog:productList`,
				description: `Read about productList.`,
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
			const  {productAutoId}  = req.body;
			const userCart = req.cookies.userCart;
			if (productAutoId!='') {
					let isAlreadyInCart = await db.cart.findOne({
					where: {
						userCookie: userCart,
						productAutoId: productAutoId
					}
					});
					if(!isAlreadyInCart){
						await db.cart.create({
							userCookie: userCart,
							productAutoId: productAutoId,
							qty: 1
						});
					}
			 
			}else{
			
			}
			res.redirect('back'); // back to the previous page
		} catch (error) {
	
		}
	}
	async  removeFromCart(req, res) {
		try {
			const  {productAutoId}  = req.body;
			const userCart = req.cookies.userCart;
		if (productAutoId!='') {
			await db.cart.destroy({
				where: {
					userCookie: userCart,
					productAutoId: productAutoId
				}
				});
			 
			}
			res.redirect('back'); // back to the previous page
		} catch (error) {
	
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
}

export default new HomeController();
