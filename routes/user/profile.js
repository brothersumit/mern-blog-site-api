const express = require('express');
const Router = express.Router();
const auth = require('../../middleware/auth');
const Users = require('../../models/userModel');

Router.get('/', auth, (req, res, next) => {
	//console.log(req.user.id);
	Users.findOne({_id: req.user.id}, {firstname: 1, lastname: 1, role: 1, email: 1})
	.then((user) => {
		if(user !== null){
			res.json({
				success: true,
				message: 'User fetched successfully',
				data: user
			});
		}
	}).catch((err) => next(err));
});

module.exports = Router;