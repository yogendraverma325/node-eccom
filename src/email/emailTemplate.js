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

export default {
  contactus,
  otp
};
