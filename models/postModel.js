const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var postSchema = new Schema({
  title:  {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  author: {
    type: String
  }
}, {
  timestamps: true
});

var Posts = mongoose.model('posts', postSchema);
module.exports = Posts;
