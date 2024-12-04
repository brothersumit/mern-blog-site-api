var express = require('express');
var router = express.Router();
var fs = require("fs");
var nodemailer = require("nodemailer");
var ejs = require("ejs");
const path = require('path');

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
  },
  tls: { rejectUnauthorized: false }
});

module.exports =  function(senderEmail, subject,  template, maildata, status){
  ejs.renderFile(path.join(__dirname, '/views/email/') + template, maildata, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: '"MERN Blog Site" skumarwebdev@gmail.com',
          to: senderEmail,
          subject: subject,
          html: data
        };
        //console.log("html", mailOptions.html);
        transporter.sendMail(mailOptions, function (err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log('Message sent: ' + info.response);
            return status = info.response;
          }
        });
      }
    });
}
