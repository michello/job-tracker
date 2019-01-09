const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interviewSchema = new mongoose.Schema({
  job_id: {type: Schema.Types.ObjectId, ref: 'Application'},
  type: {type: String, required: true},
  comments: [String],
  user: {type: Schema.Types.ObjectId, ref: 'User', required:true}
});


module.exports = mongoose.model('Interview', interviewSchema);