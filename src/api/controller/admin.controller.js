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
                const limit=20;
                const offset = (page - 1) * limit;
                const vendors = await db.vendors.findAndCountAll({
                // Pagination Flags
                limit: limit > 0 ? parseInt(limit) : null,
                offset: offset > 0 ? parseInt(offset) : 0,
                subQuery: false, // <--- YE SABSE ZAROORI HAI
                distinct: true,  // <--- Taaki count sahi aaye (Duplicate products na gine)
                });
            console.log("products",JSON.stringify(vendors,null,2))	
            res.render('masters/vendors', {
            title: 'vendors',
            description: 'vendors(s)',
            vendors
            });
            
        } catch (error) {
            console.log("error",error);
        }
    }
    async  change_vendor_status(req, res) {
        const transaction = await db.sequelize.transaction();
            try {
            let vendor_id = helper.generateJwtOTPDecrypt(req.params.vendor_id);
            let status = helper.generateJwtOTPDecrypt(req.params.status);
            await db.vendors.update(
              {
               status:!status
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
      	res.redirect('back'); 
			
		}
    }

}

export default new AdminController();
