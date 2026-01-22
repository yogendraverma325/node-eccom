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
            res.redirect('/admin/vendors'); // back to the previous page
            
        } catch (error) {
          await transaction.rollback();
         req.flash('message', JSON.stringify({ type: 'error', text: 'Something Went Wrong' }));	
          res.redirect('/admin/vendors'); // back to the previous page
			
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

}

export default new AdminController();
