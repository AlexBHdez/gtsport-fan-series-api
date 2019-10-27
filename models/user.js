const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

module.exports = model('User', userSchema);
