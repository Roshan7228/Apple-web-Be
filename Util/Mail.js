const nodemailer = require("nodemailer");
require("dotenv").config();

async function SendMail(MailHTMLTemplte,Email,Subject) {
    try {
        const transporter = nodemailer.createTransport({
           service:process.env.Services,
            auth: {
                user: process.env.CompanyEmail,
                pass: process.env.Password,
            },
        });
        const info = await transporter.sendMail({
            from: process.env.CompanyEmail,
            to: Email,
            subject: Subject,
            html: MailHTMLTemplte, 
        });
    } catch (error) {
        console.log("Error sending email:",error);
    }
}

module.exports=SendMail;