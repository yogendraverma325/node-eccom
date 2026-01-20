import moment from "moment";


const contactus = async (data) => {
 let htmlContent = ` <!-- Header --> <tr> <td style="background:#0d6efd; padding:20px; text-align:center; color:#ffffff;">
       <h2 style="margin:0;">Local Travel Stay</h2> </td> </tr>
        <!-- Body --> <tr> <td style="padding:30px;"> 
        <h3 style="color:#222;">Hello ${data.name},</h3> 
        <p style="color:#555; line-height:1.6;"> Thank you for reaching out to <strong>Local Travel Stay</strong>. 
        We have successfully received your message and our support team will review it shortly. </p>
         <p style="color:#555; line-height:1.6;"> <strong>Subject:</strong> ${data.subject}
         <br> <strong>Your Message:</strong><br> ${data.message}
         </p> <p style="color:#555; line-height:1.6;"> Our team will get back to you as soon as possible. We appreciate your patience. </p> <p style="color:#555;"> Regards,<br> <strong>Local Travel Stay Support Team</strong> </p> </td> </tr> <!-- Footer --> <tr> 
         <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;"> © 2026 Local Travel Stay. All rights reserved. </td> </tr> </table> </td> </tr>`;
 return htmlContent;;
}
const otp = async (data) => {
 let htmlContent = `<!-- Header --> <tr> 
 <td style="background:#0d6efd; padding:20px; text-align:center; color:#ffffff;">
  <h2 style="margin:0;">Local Travel Stay</h2> </td> </tr> <!-- Body --> 
  <tr> <td style="padding:30px;"> <h3 style="color:#222;">Hello ${data.userData.name},</h3> <p style="color:#555; line-height:1.6;"> Your One-Time Password (OTP) for verification is: </p> 
  <div style="text-align:center; margin:30px 0;"> <span style="display:inline-block; font-size:28px; letter-spacing:5px; font-weight:bold; color:#0d6efd; background:#f1f5ff; padding:12px 24px; border-radius:6px;"> ${data.newOtp} </span> </div>
   <p style="color:#555; line-height:1.6;"> Please do not share this code with anyone for security reasons. </p> <p style="color:#555;"> If you did not request this OTP, please ignore this email. </p> <p style="color:#555;"> Regards,<br> <strong>Local Travel Stay Team</strong> </p> </td> </tr> <!-- Footer --> <tr> <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;"> © 2026 Local Travel Stay. All rights reserved. </td> </tr> </table> </td> </tr>`;
 return htmlContent;;
}
const orderConfirmation = async (data) => {
 let htmlContent = `<!-- Header --> <tr> <td style="background:#0d6efd; padding:20px; text-align:center; color:#ffffff;"> 
 <h2 style="margin:0;">Local Travel Stay</h2> <p style="margin:5px 0 0;">Order Confirmation</p> </td> </tr> 
 <!-- Body --> <tr> <td style="padding:30px;"> <h3 style="color:#222;">Hello ${data.name},</h3> 
 <p style="color:#555; line-height:1.6;"> Thank you for your order! 🎉 Your order has been successfully placed and is being processed.
  </p> <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee; margin:20px 0;"> <tr> 
  <td style="background:#f9f9f9;"><strong>Order Number</strong></td> <td>${data.orderNumber}</td> </tr> 
  <tr> <td style="background:#f9f9f9;"><strong>Order Date</strong></td> <td>${moment().format('dddd, MMMM Do YYYY, h:mm:ss A')}</td> </tr>
   <tr> <td style="background:#f9f9f9;"><strong>Payment Method</strong></td> <td>${data.paymentMehthod}</td> </tr>
    <tr> <td style="background:#f9f9f9;"><strong>Total Amount</strong></td> <td>₹ ${data.grandTotal}</td> </tr> 
    </table> <p style="color:#555;"> You will receive another email once your order is shipped. 
    </p> <p style="color:#555;"> If you have any questions, feel free to contact our support team. </p> 
    <p style="color:#555;"> Regards,<br> <strong>Local Travel Stay Team</strong> </p> </td> </tr> 
    <!-- Footer --> <tr> <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;"> © 2026 Local Travel Stay. All rights reserved. </td>
     </tr> </table> </td> </tr>`;
 return htmlContent;;
}

export default {
  contactus,
  otp,
  orderConfirmation
};
