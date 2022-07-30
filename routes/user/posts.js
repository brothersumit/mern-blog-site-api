const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Posts = require('../../models/postModel');

router.get('/', auth, (req, res, next) => {
	const user_id = req.user.id;
	console.log(user_id);

	Posts.find({author: user_id})
    .then((posts) => {

        res.header("Access-Control-Allow-Origin", "*");
        res.json({
			success: true,
            message: 'Posts fetched successfully',
            data: posts
		});
    }, (err) => next(err))
    .catch((err) => next(err));
})

//add post function 
router.post('/', auth, function(req, res, next){
    formdata = {
        title: req.body.title,
        description: req.body.description,
        author: req.user.id
    }
	//console.log(formdata);
	Posts.create(formdata)
	.then((post) => {
	res.json({message: 'Post Inserted successfully!'});
	}).catch((err) => next());
})

//update user post function 
router.put('/:id', auth, function(req, res, next){
    formdata = {
        title: req.body.title,
        description: req.body.description,
    }
	Posts.updateOne({_id: req.params.id }, formdata)
	.then((post) => {
		res.json({message: 'Post Updated successfully!'});
	}).catch((err) => next());
})

//delete user post function 
router.delete('/:id', auth, function(req, res, next){
	Posts.deleteOne({_id: req.params.id })
	.then((post) => {
		res.json({message: 'Post Deleted successfully!'});
	}).catch((err) => next());
})



module.exports = router



