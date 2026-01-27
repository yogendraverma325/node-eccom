import db from "../../config/db.config.js";
import respHelper from "../../helper/respHelper.js";
import helper from "../../helper/helper.js";
import {returnCartList} from "../services/cartService.js";
import { getCategories } from "../services/home.service.js";
import { Op, fn, col, where} from 'sequelize';
import validator from "../../helper/validator.js";
import {getState,getCity,getPincodes,businessLogic} from "../services/centralService.js"
import bcrypt from "bcryptjs";
import moment from 'moment';
import eventEmitter from "../services/eventService.js";
class AdminController {
    async vendorList(req, res) {
           req.session.lastUrl =req.originalUrl;
        try {
                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
                const vendors = await db.vendors.findAndCountAll({
                // Pagination Flags
                limit: limit > 0 ? parseInt(limit) : null,
                offset: offset > 0 ? parseInt(offset) : 0,
                subQuery: false, // <--- YE SABSE ZAROORI HAI
                distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
                order: [['createdAt', 'DESC']]
                });
                //   JSON.stringify(productDetails, null, 2)
                const totalRecords = vendors.count;
				const totalPages = Math.ceil(totalRecords / limit);
            res.render('masters/vendors', {
            title: 'vendors',
            description: 'vendors(s)',
            vendors,
            totalPages,
            page
            });
            
        } catch (error) {
            console.log("error",error);
        }
    }
    async  change_vendor_status(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=100;
            try {
            let vendor_id = helper.generateJwtOTPDecrypt(req.params.vendor_id);
            let status = helper.generateJwtOTPDecrypt(req.params.status);
            await db.vendors.update(
              {
               status:!status,
               updatedBy:AdminId
              },
              {
                where: {
                  id: vendor_id
                },
                transaction
              }
            );
            await transaction.commit();
            req.flash('message', JSON.stringify({ type: 'success', text: `Vendor's status has been changed` }));
           res.redirect(lastUrl); // back to the previous page
            
        } catch (error) {
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
          res.redirect(lastUrl); // back to the previous page
			
		}
    }
     async addvendorForm(req, res) {
         const transaction = await db.sequelize.transaction();
           let AdminId=100;
		try {
            let formError = {};
			let formData = {};

            if (req.method === 'GET') {
                   return res.render('masters/addVendor', {
                title: 'Add vendor',
                description: 'Add vendor',
                formError,
                formData
                });
			}


            const { error, value } = validator.addvendorSchema.validate(req.body, {
                            abortEarly: false // 🔥 saare errors ek sath
                            });
            if (error) {
            let errors={}
            error.details.forEach(err => {
            errors[err.path[0]] = err.message;
            });
            formError=errors;
            formData=value;

            return res.render('masters/addVendor', {
            title: 'Add vendor',
            description: 'Add vendor',
            formError,
            formData
            });
            }
            const existingVendor = await db.vendors.findOne({
            where: {
            [db.Sequelize.Op.or]: [
            { phone: value.phone },
            { email: value.email }
            ]
            }
            });
            if(existingVendor){
                req.flash('message', JSON.stringify({ type: 'error', text: 'Phone Or email already exists' }));	
              return  res.redirect('/admin/add-vendor');
            }
            await  db.vendors.create({
                vendor_name:value.name,
                phone:value.phone,
                email:value.email,
                address:value.address,
                status:0,
                city:328,
                createdBy:AdminId
            },transaction);

					
		   await transaction.commit();
             req.flash('message', JSON.stringify({ type: 'success', text: `Vendor has been added` }));
            res.redirect('/admin/vendors'); // back to the previous page
			
		} catch (error) {
             await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
             res.redirect('/admin/add-vendor');
			
		}
	}
   async vendorDomains(req, res) {
        try {
          req.session.lastUrl =req.originalUrl;

              let vendor_id = helper.generateJwtOTPDecrypt(req.params.vendor_id);

                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
                  console.log("vendor_id 1",vendor_id)
                const vendor_services = await db.vendor_services.findAndCountAll({
                    attributes: ['id',"vendor_id","status"],
                  where:{
                    vendor_id:vendor_id
                  },
                  include: 
                      {
                        model: db.category,
                        attributes: ['catAutoId',"categoryName"],
                        where:{
                        isActive:1
                        },
                      },
                // Pagination Flags
                limit: limit > 0 ? parseInt(limit) : null,
                offset: offset > 0 ? parseInt(offset) : 0,
                subQuery: false, // <--- YE SABSE ZAROORI HAI
                distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
                order: [['created_at', 'DESC']]
                });
                  // console.log("vendor_id 2", JSON.stringify(vendor_services, null, 2))
                
                const totalRecords = vendor_services.count;
				const totalPages = Math.ceil(totalRecords / limit);
            res.render('masters/vendorDomain', {
            title: 'vendors domain',
            description: 'vendors domain(s)',
            vendor_services,
            totalPages,
            page
            });
            
        } catch (error) {
             res.redirect(lastUrl); // back to the previous page
        }
    }
       async  change_vendor_domain_status(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=100;
            try {
            let vendor_service_id = helper.generateJwtOTPDecrypt(req.params.vendor_service_id);
            let status = helper.generateJwtOTPDecrypt(req.params.status);
            await db.vendor_services.update(
              {
               status:!status,
               updatedBy:AdminId
              },
              {
                where: {
                  id: vendor_service_id
                },
                transaction
              }
            );
            await transaction.commit();
            req.flash('message', JSON.stringify({ type: 'success', text: `Vendor's domain status has been changed` }));
             res.redirect(lastUrl); // back to the previous page
            
        } catch (error) {
          console.log("error",error)
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
         res.redirect(lastUrl); // back to the previous page
			
		}
    }
    	async  vendorDomainServices(req, res) {
      req.session.lastUrl =req.originalUrl;
		try {
      const page = req.query.page || 1;     // "page"
      let vendor_service_id = helper.generateJwtOTPDecrypt(req.params.vendor_service_id);
      const limit=20;
      const offset = (page - 1) * limit;

    let order = [['createdAt', 'DESC']]; // default (Popularity / New)
    const vendor_service_items = await db.product.findAndCountAll({
        where: {
           vendor_service_id:vendor_service_id
        },
        // Pagination Flags
        limit: limit > 0 ? parseInt(limit) : null,
        offset: offset > 0 ? parseInt(offset) : 0,
        subQuery: false, // <--- YE SABSE ZAROORI HAI
        distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
        order: order
    });
      const totalRecords = vendor_service_items.count;
				const totalPages = Math.ceil(totalRecords / limit);
            res.render('masters/vendor_service_items', {
            title: 'vendors service items',
            description: 'vendor service items(s)',
            vendor_service_items,
            totalPages,
            page,
            vendor_service_id
            });
      //  console.log("vendor_services", JSON.stringify(vendor_service_items, null, 2))
    }
    catch (error) {
          console.log("error",error)
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
         res.redirect('/'); // back to the previous page
			
		}
  }
     async  change_service_item_status(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=100;
            try {
            let service_item_id = helper.generateJwtOTPDecrypt(req.params.service_item_id);
            let status = helper.generateJwtOTPDecrypt(req.params.status);
            await db.product.update(
              {
               isActive:!status,
               updatedBy:AdminId
              },
              {
                where: {
                  product_auto_id: service_item_id
                },
                transaction
              }
            );
            await transaction.commit();
            req.flash('message', JSON.stringify({ type: 'success', text: `Service item status has been changed` }));
             res.redirect(lastUrl); // back to the previous page
            
        } catch (error) {
          console.log("error",error)
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
         res.redirect(lastUrl); // back to the previous page
			
		}
    }

       async add_service_item(req, res) {
          req.session.lastUrl =req.originalUrl;
      
        const transaction = await db.sequelize.transaction();
        let AdminId=100;
        let service_item_id = helper.generateJwtOTPDecrypt(req.params.service_item_id);
      
		try {
        let formError = {};
        let formData = {};

            if (req.method === 'GET') {
     
  
              return res.render('masters/addService', {
              title: 'Add Service',
              description: 'Add Service',
              formError,
              formData,
              service_item_id
              });
			}

            const { error, value } = validator.addProductSchema.validate(req.body, {
                            abortEarly: false // 🔥 saare errors ek sath
                            });
            if (error) {
            let errors={}
            error.details.forEach(err => {
            errors[err.path[0]] = err.message;
            });
          if (!req.file) {
          errors.image = "Product image is required";
          }
            formError=errors;
            formData=value;

            return res.render('masters/addService', {
              title: 'Add Service',
              description: 'Add Service',
              formError,
              formData,
              service_item_id
              });
            }
              let lastUrl=res.locals.lastUrl;
              
            await  db.product.create({
              slug:helper.generateSlug(value.name),
              name:value.name,
              description:value.description,
              long_description:value.long_description,
              price:value.price,
              offerprice:value.offerprice,
              price_type:value.price_type,
              capacity:value.capacity,
              unit:value.unit,
              rating:value.rating,
              image:req.file.path,
              vendor_service_id:service_item_id,
              createdBy:AdminId
            },transaction);

					
		   await transaction.commit();
             req.flash('message', JSON.stringify({ type: 'success', text: `Service  has been added` }));
            res.redirect(lastUrl); // back to the previous page
			
		} catch (error) {
             await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
             res.redirect('/admin/add-vendor');
			
		}
	}
}

export default new AdminController();
