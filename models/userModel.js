const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false);

var userSchema = new Schema({
  firstname:  {
    type: String,
    required: true
  },
  lastname:  {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email:  {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  forgot_password_token: {
    type: String,
    default: null
  },
  email_verify_token: {
    type: String,
    default: null
  },
}, {
  timestamps: true
});

var Users = mongoose.model('User', userSchema);
module.exports = Users;
