const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    dob: {
      type: Date,
      required: true
    },
    credit_scores: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true   //createdAt & updatedAt
  }
);

const User = mongoose.model('User', userSchema);
