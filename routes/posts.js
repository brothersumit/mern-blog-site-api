var express = require('express');
var router = express.Router();
const Posts = require('../models/postModel');
const auth = require('../middleware/auth');

/* GET posts page. */
router.get('/', auth, function(req, res, next){
    Posts.find({})
    .then((posts) => {
        data = {
            posts: posts
        }
        res.json(data);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//add post function 
router.post('/', auth, function(req, res, next){
    
    formdata = {
        title: req.body.title,
        description: req.body.description,
        author: '61dacd251af09f364068ac43'
      }
      //console.log(formdata);
      Posts.create(formdata)
      .then((post) => {
        //console.log('Inserted:', recipe);
        res.json({message: 'Post Inserted successfully!'});
      }).catch((err) => next());
})

module.exports = router;
