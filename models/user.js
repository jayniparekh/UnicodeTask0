import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
    },
    dob: {
      type: Date,
      required: true
    },
    credit_scores: {
      type: Number,
      default: 0
    },
    profile_image: {
        type: String,
        default: null
    }
  },
  {
    timestamps: true   //createdAt & updatedAt
  }
);

// Instance method: compare plaintext password with stored hash
userSchema.methods.isPasswordValid = async function(plainPassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};


const User = mongoose.model('User', userSchema);
export default User;