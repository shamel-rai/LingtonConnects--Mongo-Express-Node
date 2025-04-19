const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      select: false, // Prevents password from being included in query results by default
    },
    passwordChangedAt: Date,
    profilePicture: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    post: {
      type: Number,
      default: 0,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    roadmapAccess: {
      type: Boolean,
      default: false
    },
    paidAt: { type: Date },
    paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  // Set the passwordChangedAt field only if the user is not new
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Ensure the timestamp precedes JWT issuance
  }

  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;

  console.log("Stored hashed password", this.password);
  console.log("Password to compare", candidatePassword);
  return bcrypt.compare(candidatePassword.trim(), this.password.trim());
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
