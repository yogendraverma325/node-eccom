import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import {returnCartList} from "../services/cartService.js";
import { getCategories } from "../services/home.service.js";
import { Op, fn, col, where} from 'sequelize';
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
}

export default new HomeController();
