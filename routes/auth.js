var express = require('express');
var router = express.Router();
const Users = require('../models/userModel');
const { body, validationResult } = require('express-validator');
var passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
var mailer = require('../mailer');
const auth = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

//===================
router.get('/', (req, res, next) => {
  data = { errors: null }
  console.log(require('crypto').randomBytes(32).toString('hex'));
  res.json({ message: 'Logged in successfully!' });
});

//=====================
router.post('/login', (req, res, next) => {
    //console.log(req.session.user);

  if ((!req.body.email) && (!req.body.password)) {
    data = {
      errors: "Email & Password is required!"
    }
    //console.log(data);
    res.json({message: data});
  }
  email = req.body.email;
  password = req.body.password;

  //Users.findOne({"email": email, "password": password})
  Users.findOne({"email":email})
    .then((user) => {
      //console.log(user);
      
      if (user !== null) {

        if (passwordHash.verify(password, user.password)) {
          var token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET, { expiresIn: 86400 });          
          userdata = {
            'email': user.email,
            'role': user.role,
            'userid': user._id,
            'firstname': user.firstname,
            'lastname': user.lastname,
            'token': token
          };
          res.header("Access-Control-Allow-Origin", "*");

          res.json({
            success: true,
            message: 'Logged In successfully',
            data: userdata
          });

        } else {
          data = { errors: "Email or Password is incorrect!" }
          res.json({
            success: false,
            message: 'Could Not Login',
            data: data
          });
        }
      }
      
    }).catch((err) => next(err));
   
});


//=====================
router.post('/register',
  //check form validation
  body('firstname').isLength({ min: 1 })
    .withMessage('Required'),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 5 })
    .withMessage('must be at least 5 chars long')
    .matches(/\d/)
    .withMessage('must contain a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //return res.status(400).json({ errors: errors.array() });
      data = { errors: errors.array() };
      console.log(data);
      res.json({message: data});
    }

    var formdata = {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "role": req.body.role,
      "email": req.body.email,
      "password": passwordHash.generate(req.body.password)
    }

    //check if user already exists
    Users.findOne({"email":req.body.email})
    .then((user) => {
      if(user != null){
        data = { errors: "User Already exists with this email." }
        res.json({
          success: false,
          message: 'Could not Register.',
          data: data
        });
      }else{
        //Create user
        Users.create(formdata)
          .then((user) => {
            if (user == null) {
              res.send({message: 'Could not register!'});
            } else {

              emailVerifyTokenData = {
                email: user.email,
                emailVerifyToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
              }
            
              //users create starts
              Users.findByIdAndUpdate(user._id, { email_verify_token: emailVerifyTokenData.emailVerifyToken })
                .then((user) => {
                  //send Email
                  mailData = {
                    name: user.firstname,
                    emailVerifyToken: jwt.sign(emailVerifyTokenData, 'email-verify-token')
                  }
                  mailer(req.body.email, 'Verify your email', 'welcome-email.ejs', mailData);
                  //console.log(user);
                  var token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
                    expiresIn: 86400 //expires in 24 hours
                  });
                  res.json({
                    message: 'Registration successfull!',
                    token: token
                  });
                }).catch((err) => next());
                //user create ends

            }
          }).catch((err) => next(err));
        }

      }).catch((err) => next(err));

  });

//=====================
router.get('/email-verify/:token', (req, res, next) => {
  let decodedToken = jwt.verify(req.params.token, 'email-verify-token');
  Users.findOne({ "email": decodedToken.email, "email_verify_token": decodedToken.emailVerifyToken })
    .then((user) => {
      if (user == null) {
        res.redirect('/auth');
      } else {
        Users.findByIdAndUpdate(user._id, { email_verify_token: null })
          .then((user) => {
            data = { errors: null }
            res.render('user/emailverified', data);
          }).catch((err) => next());
      }

    }).catch((err) => next(err));
})

//=====================
router.post('/forgot-password', (req, res, next) => {
  if (!req.body.email) {
    data = { errors: "Email required!" }
    res.render('user/forgotpass', data);
  }
  var formdata = { "email": req.body.email, }
  Users.findOne(formdata)
    .then((user) => {
      if (user == null) {
        data = { errors: "Email does not exists!" };
        res.render('user/forgotpass', data);
      } else {

        dataToken = {
          email: user.email,
          forgot_password_token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        }

        Users.findByIdAndUpdate(user._id, { forgot_password_token: dataToken.forgot_password_token })
          .then((user) => {
            //send Email
            mailData = {
              name: user.firstname,
              encodedToken: jwt.sign(dataToken, 'forgot-pass-token')
            }
            mailer(req.body.email, 'Reset your password', 'temp-forgot-pass.ejs', mailData);
            //console.log(user);
            data = { errors: null, }
            res.render('user/linksent', data);
          }).catch((err) => next(err));
      }
    }).catch((err) => next(err));

});


//=====================
router.post('/reset-password', (req, res, next) => {
  if (!req.body.password) {
    data = { errors: "Password required!" }
    res.render('user/resetpass', data);
  }
  Users.findOne({ "email": req.body.email })
    .then((user) => {
      Users.findByIdAndUpdate(user._id, { password: passwordHash.generate(req.body.password), forgot_password_token: null })
        .then((user) => {
          res.redirect('/auth');
        }).catch((err) => next());

    }).catch((err) => next(err));

});


//=====================
router.get('/logout', (req, res, next) => {
  req.session.destroy();
  res.redirect('/auth');
});

module.exports = router;
