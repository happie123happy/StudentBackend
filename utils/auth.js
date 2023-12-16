import jwt from "jsonwebtoken"

const sendToken = (user, status, res) => {
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
        process.env.JWT_SECRET,
      {expiresIn:86400}
    );

    res.status(status).json({user,token})
}

export {sendToken};