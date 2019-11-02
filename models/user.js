const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = model('User', userSchema);
