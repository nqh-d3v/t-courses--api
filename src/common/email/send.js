/* eslint-disable strict */

'use strict';

const nodemailer = require('nodemailer');
const mailContent = require('./info');

/**
 * This function will send email to user
 * @param {Object} to - Include { address, name } 
 * @param {String} type - Type of email
 * @param {Object} options - Include {  }
 */
async function sendEmail(to, type, options) {
    const contentMail = mailContent(type, options);
    const content = `<div style="width: 100%; position: relative; background-color: #8b00cc; box-sizing: border-box; padding: 10px 0 40px 0; font-size: 14px;">
    <div style="width: 100%; max-width: 600px; margin: auto; position: relative;">
      <div style="width: 100%; padding: 20px 0 0 0; box-sizing: border-box; display: flex; flex-direction: row; justify-content: space-between;">
        
        <div style="width: 60px; height: 60px;"></div>
      </div>
      <div style="background-color: white; color: #8b00cc; border-radius: 8px; width: 100%; padding: 30px 20px; box-sizing: border-box; font-size: 15px; font-weight: 500; position: relative;">
        Hi <b>${to.name}</b>,<br>${contentMail.content}
      </div>
      <div style="width: 100%; padding: 10px; box-sizing: border-box; color: white;">
        Mọi thắc mắc vui lòng truy cập <b>Trang Hỗ trợ người dùng</b> tại <a style="text-decoration: none; font-weight: bold; color: white;" href="">đây</a>
      </div>
    </div>
  </div>`;
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HST || 'https://email.host.com',
        port: process.env.EMAIL_PRT || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USR || 'email_username',
            pass: process.env.EMAIL_PWD || 'email_password',
        },
    });
    console.log(contentMail);
    const info = await transporter.sendMail({
        from: '"T-Courses" <hi@toladev.info>',
        to: to.address,
        subject: contentMail.title,
        text: contentMail.content,
        // html: '123',
        // attachments: [{
        //     path: 'https://scontent.fvca1-1.fna.fbcdn.net/v/t1.15752-9/132645464_3381278188649266_3638089649663241891_n.png?_nc_cat=103&ccb=2&_nc_sid=ae9488&_nc_ohc=4Z9LBLrUAB0AX9-nv81&_nc_ht=scontent.fvca1-1.fna&oh=73f07b907f8200a5d97bff14b4310ad7&oe=6006A07D',
        //     cid: 'logo_tcourse',
        // }]
    });

    return info;
}

module.exports = sendEmail;
