import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// define user schema
const StudentSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    required: [true, "Can't be blank"],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please use a valid address"],
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [8, "Please use minimum of 8 characters"],
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    phone: String,
    gender: String,
    address: {
      fulladdress: String,
      city: String,
      state: String,
      country: String,
      pin: String,
      coordinates: {
        lat: String,
        long: String,
      },
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,

  active: { type: Boolean, default: true },

  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  role: {
    type: String,
    default: "S",
  },
});

StudentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

StudentSchema.methods.matchPassword = async function (password) {
  return bcrypt.compareSync(password, this.password);
};
StudentSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "secret__123", {
    expiresIn: process.env.JWT_EXPIRE || "10min",
  });
};
StudentSchema.methods.getResetPasswordToken = function () {
  const resetToken = uuidv4();
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
  return resetToken;
};

export const Student = model("Student", StudentSchema);

const InstructorSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    required: [true, "Can't be blank"],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please use a valid address"],
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: [8, "Please use minimum of 8 characters"],
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    phone: String,
    gender: String,
    address: {
      fulladdress: String,
      city: String,
      state: String,
      country: String,
      pin: String,
      coordinates: {
        lat: String,
        long: String,
      },
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,

  active: { type: Boolean, default: true },

  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  role: {
    type: String,
    default: "T",
  },
});

export const Instructor = model("Instructor", InstructorSchema);