// models/Client.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: {
    type: String,
    required: [true, "Password confirmation is required"],
    validate: {
      validator: function (value) {
        // `this.password` is available only on `save()` or `create()`
        console.log();
        return value === this.password;
      },
      message: "Passwords do not match",
    },
  },
  image: { type: String },
  role: { type: String, default: 'client' },
  phone: { type: String },
  resetCode: {
    type: Number,
    required: false,
  },
  resetCodeExpiresAt: {
    type: Date,
    required: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationExpires: {
    type: Date,
  },
  isResetCodeValide: {
    type: Boolean,
    default: false
  }
},
  { timestamps: true });


// Hash password before saving
clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined; // Remove the confirmation field
  this.ChangesAt = Date.now() - 1000;
  next();
});

// Method to compare passwords
clientSchema.methods.correctPassword = async function (candidatePassword, currentPassword) {
  return await bcrypt.compare(candidatePassword, currentPassword);
};
clientSchema.methods.changedPasswordAfter = function (JWTTimestamps) {
  if (this.ChangesAt) {
    const changedTimestamps = parseInt(this.ChangesAt.getTime() / 1000, 10);
    return JWTTimestamps < changedTimestamps;
  }
  // false means that the pass does not changed
  return false;
}

clientSchema.methods.createResetPassToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date() + 10 * 60 * 1000;
  return resetToken
}
module.exports = mongoose.model('Client', clientSchema);
