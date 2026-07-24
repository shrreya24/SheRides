const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    governmentId: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    ridesCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['New', 'Active', 'Trusted'],
      default: 'New',
    },
    // Women only — enforce on registration
    gender: {
      type: String,
      default: 'female',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update status based on rides count
userSchema.methods.updateStatus = function () {
  if (this.ridesCount >= 20) this.status = 'Trusted';
  else if (this.ridesCount >= 5) this.status = 'Active';
  else this.status = 'New';
};

module.exports = mongoose.model('User', userSchema);
