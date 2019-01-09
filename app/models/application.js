const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');

const applicationSchema = new mongoose.Schema({
  company: {type: String, required: true},
  position: {type: String, required: true},
  status: {type: Boolean, default: true, required: true},
  offerred: {type: Boolean, default: false, required: true},
  applied: {type: String, required: true},
  stage: {type: String, default: 'Applied', required: true},
  user: {type: Schema.Types.ObjectId, ref: 'User'}
}, {
  _id: true
});

applicationSchema.plugin(URLSlugs('_id'));
module.exports = mongoose.model('Application', applicationSchema);