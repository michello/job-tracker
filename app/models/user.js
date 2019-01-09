const mongoose = require('mongoose');
const bycrypt = require('bcrypt-nodejs');
const URLSlugs = require('mongoose-url-slugs');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  local: {
  	username: {
  		type: String,
  		unique: true
  	},
  	password: String
  }
});

userSchema.plugin(URLSlugs('local.username'));

userSchema.methods.generateHash = function(password) {
	return bycrypt.hashSync(password, bycrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
	return bycrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('User', userSchema);