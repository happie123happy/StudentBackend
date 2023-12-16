import { ErrorResponse } from "../../utils/error.js";
import {sendToken} from "../../utils/auth.js"
import sendEmail from "../../utils/email.js"
import { Instructor } from "../../models/instructor/index.js";

const register = async (req, res,next) => {
  const { email, password } = req.body;
  try {
      const user1 = await Instructor.findOne({ email });
      if (user1) {
        return next(new ErrorResponse("email already exists", 404));
      }
        const user = await Instructor.create({
            email,
            password
        });
        sendToken(user,201,res)
    } catch (error) {
        next(error);
    }
}

const login = async (req, res,next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide a valid email and Password", 400)
    );
  }
  try {
    const user = await Instructor.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    sendToken(user, 200, res);
      
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

    const user = await Instructor.findOne({ _id:req.user.id });
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

    const user = await Instructor.findOne({
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


export {register,login,forgotPassword,resetPassword}