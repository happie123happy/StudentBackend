import { ErrorResponse } from "../../utils/error.js";
import { sendToken } from "../../utils/auth.js";
import sendEmail from "../../utils/email.js";
import { Instructor, Student } from "../../models/student/index.js";

const register = async (req, res, next) => {
  const { email, password,firstName,lastName } = req.body;
  try {
    const inst = await Instructor.findOne({ email });
    if (inst) {
      return next(new ErrorResponse("Instructor found with this email - Use a different email to signup", 404));      
    }

    const user1 = await Student.findOne({ email });
    if (user1) {
      return next(new ErrorResponse("email already exists", 404));
    }

    const user = await Student.create({
      email,
      password,
    });

    user.profile.firstName = firstName;
    user.profile.lastName = lastName;

    await user.save()

    const userData = {
      _id: user._id,
      firstName,
      lastName,
      email: user.email,
      courses: user.courses,
      role:user.role
    }
    sendToken(userData, 201, res);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide a valid email and Password", 400)
    );
  }
  try {
    const user = await Student.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    const userData = {
      _id: user._id,
      firstName:user.profile.firstName,
      lastName:user.profile.lastName,
      email: user.email,
      courses: user.courses,
      role:user.role
    };

    sendToken(userData, 200, res);
  } catch (err) {
    return res.status(500).json({ error: "cannot register user" });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (req.user.email != email) {
      return next(new ErrorResponse("Invalid Access Token", 400));
    }

    const user = await Student.findOne({ _id: req.user.id });
    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();
    // console.log(user)

    const resetUrl = `${process.env.FRONTEND_URL}passwordreset/${resetToken}`;
    const message = `
        <h1> You have requested a password reset </h1>
        <p> Please go to this link to reset your password </p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a> 
        `;
    const subject = "LurW - Password Reset";
    try {
      await sendEmail({
        to: user.email,
        text: message,
        subject: subject,
      });
      res.status(200).json({
        success: true,
        data: "Email Sent",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  console.log("Reset password");
  const { password } = req.body;
  const resetPasswordToken = req.params.resetToken;
  try {
    const user = await Student.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(201).json({
      success: true,
      data: "Password Reset successful",
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, forgotPassword, resetPassword };
