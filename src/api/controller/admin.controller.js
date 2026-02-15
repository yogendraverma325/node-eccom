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
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
// Agar aapko project root track karna hai ES modules mein:
const __dirname = path.resolve();
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
         let AdminId=1;
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
           let AdminId=1;
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
         req.session.lastUrl =req.originalUrl;
        try {
           let vendor_id = helper.generateJwtOTPDecrypt(req.params.vendor_id);
            const categories = await getCategories(0,0);
            
             const vendor_servicesList = await db.vendor_services.findAll({
               where:{
                    vendor_id:vendor_id
                  },
             });
           
          
              const serviceIds = vendor_servicesList.map(
              item => item.service_id
              );

              // categories filter karo
              const filteredCategories = categories.filter(
              cat => !serviceIds.includes(cat.catAutoId)
              );

                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
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
            page,
            filteredCategories,
            vendor_id
            });
            
        } catch (error) {
          console.log("error",error);
             res.redirect(lastUrl); // back to the previous page
        }
    }
       async  change_vendor_domain_status(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=1;
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

       const specifications = await db.specification_master.findAll(
          {
          where:{
          is_active:1
          },
          attributes:["specification_auto_id","specification_name","is_active"]

      });

				const totalPages = Math.ceil(totalRecords / limit);
            res.render('masters/vendor_service_items', {
            title: 'vendors service items',
            description: 'vendor service items(s)',
            vendor_service_items,
            totalPages,
            page,
            vendor_service_id,
            specifications
            });
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
         let AdminId=1;
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
        let AdminId=1;
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
          console.log("req.file",req.file)
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
       async edit_service_item(req, res) {
          req.session.lastUrl =req.originalUrl;
      
        const transaction = await db.sequelize.transaction();
        let AdminId=1;
        let service_item_id = helper.generateJwtOTPDecrypt(req.params.service_item_id);
      
		try {
        let formError = {};
        let formData = {};
       let  serviceData={}
        serviceData = await db.product.findOne({
                  attributes: [
                  "product_auto_id",
                  "name", 
                  "image",
                  "price",
                  "offerprice",
                  "description",
                  "long_description",
                  "price_type",
                  "capacity",
                  "unit",
                  "rating"
                    ],
                  where: {
                    product_auto_id: service_item_id
                  },
                });

            if (req.method === 'GET') {
                

              return res.render('masters/editService', {
              title: 'Edit Service',
              description: 'Edit Service',
              formError,
              formData,
              service_item_id,
              serviceData
              });
			}

            const { error, value } = validator.editProductSchema.validate(req.body, {
                            abortEarly: false // 🔥 saare errors ek sath
                            });
            if (error) {
            let errors={}
            error.details.forEach(err => {
            errors[err.path[0]] = err.message;
            });
            // if (!req.file) {
            // errors.image = "Product image is required";
            // }
            formError=errors;
            formData=value;

             return res.render('masters/editService', {
              title: 'Edit Service',
              description: 'Edit Service',
              formError,
              formData,
              service_item_id,
              serviceData
              });
            }
              let lastUrl=res.locals.lastUrl;
              let updateData={
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
             // createdBy:AdminId
              }
              if(req.file){
                  if (serviceData.image) {
                const oldImagePath = path.join(process.cwd(), serviceData.image);

                // File delete logic
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                }
              }
                  updateData.image=req.file.path;
              }
              
              await db.product.update(
                updateData,
                {
                  where: {
                    product_auto_id: service_item_id
                  },
                  transaction
                }
              );

		   await transaction.commit();
             req.flash('message', JSON.stringify({ type: 'success', text: `Service  has been updated` }));
            res.redirect(lastUrl); // back to the previous page
			
		} catch (error) {
             await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
             res.redirect('/admin/add-vendor');
			
		}
	}
  async addVendorCategoryMapping(req, res) {
    const transaction = await db.sequelize.transaction();
    try{
      let vendorId = helper.generateJwtOTPDecrypt(req.body.vendorId);
      let AdminId=1;
      let lastUrl=res.locals.lastUrl;
      console.log("req.body",vendorId)
      console.log("categoryIds",req.body.categoryIds);
      for (const item of req.body.categoryIds) {
        let categoryId = helper.generateJwtOTPDecrypt(item);
       
            await db.vendor_services.create({
            vendor_id: vendorId,
            service_id: categoryId,
            created_by:AdminId
            }, { transaction });
      }
    await transaction.commit();
    req.flash('message', JSON.stringify({ type: 'success', text: `Vendor Service Category Mapping has been added` }));
    res.redirect(lastUrl); // back to the previous page

    }
    catch (error) {
             await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
             res.redirect('/admin/add-vendor');
			
		}
  }
  async vendorLocations(req, res) {
          req.session.lastUrl =req.originalUrl;
        try {
            let vendor_service_auto_id = helper.generateJwtOTPDecrypt(req.params.vendor_service_auto_id);
            let cities=await getCity(34);

                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
                const vendor_services = await db.vendor_services_locations.findAndCountAll({
                    attributes: ['vendor_services_locations_auto_id',"vendor_service_auto_id","latitude","longitude","branch_address","status"],
                  where:{
                    vendor_service_auto_id:vendor_service_auto_id
                  },
                  include: 
                      {
                        model: db.cityMaster,
                        attributes: ['cityId',"cityName"],
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
                
                const totalRecords = vendor_services.count;
				const totalPages = Math.ceil(totalRecords / limit);
            res.render('masters/vendor_service_location', {
            title: 'vendors locations',
            description: 'vendors locations',
            vendor_services,
            totalPages,
            page,
            cities,
            vendor_service_auto_id
            });
            
        } catch (error) {
          console.log("error",error);
            // res.redirect('/admin/vendors'); // back to the previous page
        }
    }
     async  change_vendor_locations_status(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=1;
            try {
            let vendor_services_locations_auto_id = helper.generateJwtOTPDecrypt(req.params.vendor_services_locations_auto_id);
            let status = helper.generateJwtOTPDecrypt(req.params.status);
            await db.vendor_services_locations.update(
              {
               status:!status,
               updatedBy:AdminId
              },
              {
                where: {
                  vendor_services_locations_auto_id: vendor_services_locations_auto_id
                },
                transaction
              }
            );
            await transaction.commit();
            req.flash('message', JSON.stringify({ type: 'success', text: `Vendor's location status has been changed` }));
             res.redirect(lastUrl); // back to the previous page
            
        } catch (error) {
          console.log("error",error)
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
         res.redirect(lastUrl); // back to the previous page
			
		}
    }
     async addVendorLocationMapping(req, res) {
    const transaction = await db.sequelize.transaction();
     let lastUrl=res.locals.lastUrl;
    try{

    let vendor_service_auto_id = helper.generateJwtOTPDecrypt(req.body.vendor_service_auto_id);
    let citiid = helper.generateJwtOTPDecrypt(req.body.citiid);
      let AdminId=1;
       const vendor_services = await db.vendor_services_locations.create({
            vendor_service_auto_id: vendor_service_auto_id,
            city_id:citiid,
            latitude:req.body.lattitude,
            longitude:req.body.longtitude,
            branch_address:req.body.branch_address,
            created_by:AdminId
            }, { transaction });
      console.log("req.body",vendor_service_auto_id)
     
    await transaction.commit();
    req.flash('message', JSON.stringify({ type: 'success', text: `Vendor Service Location Mapping has been added` }));
    res.redirect(lastUrl); // back to the previous page

    }
    catch (error) {
             await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
             res.redirect(lastUrl);
			
		}
  }
  async service_feature_list(req, res){
		try{
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.service_item_id);
        const products = await db.product_feature_mapping.findAll(
          {
          where:{
          product_auto_id:service_item_id
          },
          attributes:["product_feature_mapping_id","feature_value","is_active"]

      });

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: products,
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
    async service_feature_status_change(req, res){
		try{
        let service_item_id = (req.body.service_item_id);
        console.log("service_item_id",service_item_id)
        await db.product_feature_mapping.update(
      {
      is_active: db.sequelize.literal('IF(is_active = 1, 0, 1)')
      },
      {
      where: {
      product_feature_mapping_id: service_item_id
      }
      }
      )

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
   async add_service_feature(req, res){
		try{
      
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.product_id);
         let product_feature_mapping_id =req.body.service_item_id;
        let feature_value = (req.body.feature_value);
        let edit_mode = req.body.edit_mode;
        if(edit_mode == true){
          await db.product_feature_mapping.update({
            feature_value:feature_value
          },
          {
            where:{
              product_feature_mapping_id:product_feature_mapping_id
            }
          })
        }else{  
        await db.product_feature_mapping.create({
            product_auto_id:service_item_id,
            feature_value:feature_value,
            is_active:1
        })
      }

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service feature added Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
  }

	} 
   async edit_service_item_images(req, res) {
          req.session.lastUrl =req.originalUrl;
      
       const transaction = await db.sequelize.transaction();
        let AdminId=1;
        let service_item_id = helper.generateJwtOTPDecrypt(req.params.service_item_id);
      
		try {
        let formError = {};
        let formData = {};
       let  images=[]
        images =  await db.product_images.findAll({
      attributes: ["product_image_auto_id", "image", "is_active"],
      where: { product_auto_id: service_item_id },
      order: [["product_image_auto_id", "ASC"]], // ensure same order
    });

            if (req.method === 'GET') {
              return res.render('masters/editImages', {
              title: 'Edit Service Images',
              description: 'Edit Service Images',
              formError,
              formData,
              service_item_id,
              images
              });
			}
        let lastUrl=res.locals.lastUrl;

    const oldImages = req.body.oldImages; // hidden inputs from frontend
    let finalImages = [...oldImages];
  for (let i = 0; i < 3; i++) {
      const fileKey = `images[${i}]`;
      const newFile = req.files[fileKey]?.[0];

      // New upload → replace old
      if (newFile) {
        // Unlink old if exists
        if (oldImages[i] && fs.existsSync(oldImages[i])) {
          fs.unlinkSync(oldImages[i]);
        }

        finalImages[i] = "uploads/" + newFile.filename;
      }
      // No new file + oldImages[i] empty → user removed image
      else if (!oldImages[i]) {
        if (oldImages[i] && fs.existsSync(oldImages[i])) {
          fs.unlinkSync(oldImages[i]);
        }
        finalImages[i] = "";
      }
      // No new file + oldImages[i] exists → keep old
      else {
        finalImages[i] = oldImages[i];
      }
    }

    // Update DB
    for (let i = 0; i < 3; i++) {
      const imgRecord = images[i];

      if (imgRecord) {
        await db.product_images.update(
          { image: finalImages[i] || null ,updatedBy:AdminId}, // empty string → null
          { where: { product_image_auto_id: imgRecord.product_image_auto_id } },
          transaction
        );
      } else if (finalImages[i]) {
        // If slot empty in DB but new file exists, create it
        await db.product_images.create({
          product_auto_id: service_item_id,
          image: finalImages[i],
          is_active: 1,
          createdBy:AdminId
        },transaction);
      }
    }

     

         await transaction.commit();
              req.flash('message', JSON.stringify({ type: 'success', text: `Service  has been updated` }));
            res.redirect(lastUrl); // back to the previous page
			
		} catch (error) {
            await transaction.rollback();
            console.log("error",error);
            req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
            res.redirect(lastUrl); // back to the previous page
			
		}
	}
   async service_meta_list(req, res){
		try{
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.service_item_id);
        const products = await db.product_meta_data.findAll(
          {
          where:{
          product_auto_id:service_item_id
          },
          attributes:["product_meta_data_auto_id","meta_data","is_active","visibility"]

      });

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: products,
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
   async add_service_meta_data(req, res){
		try{
      
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.product_id);
         let product_feature_mapping_id =req.body.service_item_id;
        let feature_value = (req.body.feature_value);
        let edit_mode = req.body.edit_mode;
        if(edit_mode == true){
          await db.product_meta_data.update({
            meta_data:feature_value
          },
          {
            where:{
              product_meta_data_auto_id:product_feature_mapping_id
            }
          })
        }else{  
        await db.product_meta_data.create({
            product_auto_id:service_item_id,
            meta_data:feature_value,
            is_active:1,
            visibility:0
        })
      }

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service meta data added Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
  }

	} 
   async service_meta_data_status_change(req, res){
		try{
        let service_item_id = (req.body.service_item_id);
        await db.product_meta_data.update(
      {
      is_active: db.sequelize.literal('IF(is_active = 1, 0, 1)')
      },
      {
      where: {
      product_meta_data_auto_id: service_item_id
      }
      }
      )

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
  async service_meta_data_visibility_change(req, res){
		try{
        let service_item_id = (req.body.service_item_id);
        await db.product_meta_data.update(
      {
      visibility: db.sequelize.literal('IF(visibility = 1, 0, 1)')
      },
      {
      where: {
      product_meta_data_auto_id: service_item_id
      }
      }
      )

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
   async service_details_list(req, res){
		try{
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.service_item_id);
        const products = await db.product_specification_mapping.findAll(
          {
          where:{
          product_auto_id:service_item_id
          },
          include: [
          {
          model: db.specification_master,
          as: 'specification',
          attributes: ['specification_name'],
          required: false,
          }
          ]

      });

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: products,
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
   async service_details_data_status_change(req, res){
		try{
        let service_item_id = (req.body.service_item_id);
        await db.product_specification_mapping.update(
      {
      is_active: db.sequelize.literal('IF(is_active = 1, 0, 1)')
      },
      {
      where: {
      product_specification_mapping_id: service_item_id
      }
      }
      )

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service_frature_list listed Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}

	}
    async add_service_details_data(req, res){
		try{
       let AdminId=1;
        let service_item_id = helper.generateJwtOTPDecrypt(req.body.product_id);
         let product_feature_mapping_id =req.body.service_item_id;
        let feature_value = (req.body.feature_value);
           let specification_value = (req.body.sepecificatoin);
        let edit_mode = req.body.edit_mode;
        if(edit_mode == true){
          await db.product_specification_mapping.update({
            specification_auto_id:specification_value,
            specification_value:feature_value,
          },
          {
            where:{
              product_specification_mapping_id:product_feature_mapping_id,
               product_auto_id:service_item_id,
            }
          })
        }else{  
        await db.product_specification_mapping.create({
            product_auto_id:service_item_id,
            specification_auto_id:specification_value,
            specification_value:feature_value,
            is_active:1,
            createdBy:AdminId
        })
      }

			// service_frature_list
		return respHelper(res, {
		status: 200,
		data: {},
		msg:"service meta data added Successfully",
		});
	}
	catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
  }

	} 
   async qrcodes(req, res) {
           req.session.lastUrl =req.originalUrl;
        try {
                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
                const qr_codesList = await db.qr_codes.findAndCountAll({
                // Pagination Flags
                limit: limit > 0 ? parseInt(limit) : null,
                offset: offset > 0 ? parseInt(offset) : 0,
                subQuery: false, // <--- YE SABSE ZAROORI HAI
                distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
                order: [['createdAt', 'DESC']]
                });
                
            const totalRecords = qr_codesList.count;
            const totalPages = Math.ceil(totalRecords / limit);
     
            res.render('masters/qrcodes', {
            title: 'QR Codes',
            description: 'QR Codes(s)',
            qr_codesList,
            totalPages,
            page
            });
            
        } catch (error) {
            console.log("error",error);
        }
    }
    async addQrCode(req, res){
       const transaction = await db.sequelize.transaction();
           let AdminId=1;
              req.session.lastUrl =req.originalUrl;
           try{
              let formError = {};
			let formData = {};

        if (req.method === 'GET') {
          return res.render('masters/addQR', {
        title: 'Add QR ',
        description: 'Add QR ',
        formError,
        formData
        });
        }

         const { error, value } = validator.addQRCODESchema.validate(req.body, {
                            abortEarly: false // 🔥 saare errors ek sath
                            });
            if (error) {
            let errors={}
            error.details.forEach(err => {
            errors[err.path[0]] = err.message;
            });
            formError=errors;
            formData=value;

             return res.render('masters/addQR', {
        title: 'Add QR ',
        description: 'Add QR ',
        formError,
        formData
        });
            }
             let lastUrl=res.locals.lastUrl;
            console.log("value",value)

            await  db.qr_codes.create({
              created_for:value.created_for,
              redirect_url:value.redirect_url,
              createdBy:AdminId
            },transaction);

					
		       await transaction.commit();
             req.flash('message', JSON.stringify({ type: 'success', text: `QR Code has been added` }));
            res.redirect(lastUrl); // back to the previous page

           }
           catch (error) {
        await transaction.rollback();
        console.log("error",error);
        req.flash('message', JSON.stringify({ type: 'error', text: 'Something went wrong' }));	
        res.redirect('/admin/add-vendor');
			
		}

    }
    async generateQR(req, res){
const { itemId } = req.params;
      let AdminId=1;
      let QR_CODE_ID = helper.generateJwtOTPDecrypt(itemId);
      const QRCodeDAAT = await db.qr_codes.findOne({
      where:{
      qr_codes_auto_id:QR_CODE_ID
      }
      });
      if(QRCodeDAAT){
          const url = await QRCode.toDataURL(`${process.env.PROXY_URL}/QR/${itemId}`);
        let html=`<style>
    .card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 768px;
        width: 100%;
        padding: 40px;
    }

    .header {
        text-align: center;
        margin-bottom: 35px;
    }

    .card-content {
        display: flex;
        gap: 40px;
        align-items: flex-start;
    }

    .left-content {
        flex: 1;
    }

    .right-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .logo {
        font-size: 38px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 10px;
    }

    .tagline {
        color: #666;
        font-size: 19px;
    }

    .qr-container {
        background: #f8f9fa;
        border-radius: 15px;
        padding: 20px;
        display: inline-block;
    }

    #qrcode {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .services {
        margin: 20px 0;
    }

    .services h3 {
        color: #333;
        font-size: 24px;
        margin-bottom: 20px;
        font-weight: 600;
    }

    .service-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .service-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px 15px;
        background: #f8f9fa;
        border-radius: 10px;
        transition: transform 0.2s;
    }

    .service-item:hover {
        transform: translateX(5px);
        background: #e9ecef;
    }

    .service-icon {
        font-size: 36px;
        min-width: 40px;
    }

    .service-name {
        font-size: 18px;
        color: #333;
        font-weight: 500;
    }

    .scan-text {
        color: #667eea;
        font-weight: 600;
        font-size: 19px;
        text-align: center;
    }

    .url {
        color: #888;
        font-size: 15px;
        word-break: break-all;
        text-align: center;
        font-weight: 500;
    }

    .download-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 25px;
        font-size: 17px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 30px;
        transition: transform 0.2s;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    .download-btn:hover {
        transform: scale(1.05);
    }

    .footer {
        margin-top: 25px;
        color: #999;
        font-size: 14px;
        text-align: center;
    }

    @media print {
        body {
            background: white;
        }

        .download-btn {
            display: none;
        }
    }

    @media (max-width: 650px) {
        .card-content {
            flex-direction: column;
        }

        .card {
            padding: 30px 20px;
        }

        .logo {
            font-size: 32px;
        }

        .tagline {
            font-size: 16px;
        }

        .services h3 {
            font-size: 20px;
        }

        .service-name {
            font-size: 16px;
        }
    }
</style>

<div class="card">
    <div class="header">
        <div class="logo">Local Travel Stay</div>
        <div class="tagline">Your Complete Travel Solution</div>
    </div>

    <div class="card-content">
        <div class="left-content">
            <div class="services">
                <h3>Our Services</h3>
                <div class="service-list">
                    <div class="service-item">
                        <div class="service-icon">🛌</div>
                        <div class="service-name">Rooms</div>
                    </div>
                    
                    <div class="service-item">
                        <div class="service-icon">🍽️</div>
                        <div class="service-name">Restaurants</div>
                    </div>
                    <div class="service-item">
                        <div class="service-icon">🚗</div>
                        <div class="service-name">Car & Bike Rental</div>
                    </div>
                    <div class="service-item">
                        <div class="service-icon">🗺️</div>
                        <div class="service-name">Travel Guide</div>
                    </div>
                    <div class="service-item more-services">
                    <div class="service-icon">➕</div>
                    <div class="service-name">Many More...</div>
                    </div>
                </div>
            </div>
        </div>

       <div class="right-content">
    <div class="scan-text" style="font-weight: bold; margin-bottom: 10px;">Scan to Visit</div>
    
    <div class="qr-container">
        <div id="qrcode">
            <img src="${url}" alt="QR Code" style="width: 300px; height: 300px; border: 1px solid #eee; padding: 5px;" />
        </div>
    </div>

    <div style="margin: 10px 0; color: #666; font-size: 14px;">— OR —</div>

    <div class="url-text">Visit: <strong>www.localtravelstay.com</strong></div>
    
    <div class="qr-id" style="font-size: 10px; color: #999; margin-top: 5px;">Ref: ${QR_CODE_ID}</div>
</div>
    </div>
</div>`;
        
        return respHelper(res, {
        status: 200,
        data: html,
        msg:"service_frature_list listed Successfully",
        });
      }else{
        return respHelper(res, {
        status: 404,
        data: {},
        msg:"QR Code could not be generated",
          });
        }
    }
    async contacts(req, res) {
           req.session.lastUrl =req.originalUrl;
        try {
                const page = req.query.page || 1;     // "page"
                const limit=5;
                const offset = (page - 1) * limit;
                const vendors = await db.contact_us.findAndCountAll({
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
            res.render('masters/contacts', {
            title: 'contacts',
            description: 'contacts(s)',
            vendors,
            totalPages,
            page
            });
            
        } catch (error) {
            console.log("error",error);
        }
    }
      async  changeQueryStatus(req, res) {
        let lastUrl=res.locals.lastUrl;
        const transaction = await db.sequelize.transaction();
         let AdminId=1;
            try {
            let contact_id = helper.generateJwtOTPDecrypt(req.params.contact_id);
            let is_read = helper.generateJwtOTPDecrypt(req.params.is_read);
            await db.contact_us.update(
              {
               is_read:!is_read,
               updatedBy:AdminId
              },
              {
                where: {
                  contact_id: contact_id
                },
                transaction
              }
            );
            await transaction.commit();
            req.flash('message', JSON.stringify({ type: 'success', text: `status has been changed` }));
             res.redirect(lastUrl); // back to the previous page
            
        } catch (error) {
          console.log("error",error)
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
         res.redirect(lastUrl); // back to the previous page
			
		}
    }
}

export default new AdminController();
