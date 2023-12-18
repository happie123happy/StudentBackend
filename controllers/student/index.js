import { Student } from "../../models/student/index.js";
import { ErrorResponse } from "../../utils/error.js";


export const updateProfile = async (req, res, next) => {
    const { profile } = req.body;
  try {
const stud = await Student.findByIdAndUpdate(req.user.id,{profile});
if (!stud) {
  return next(new ErrorResponse("Student not found", 404));
      }

      res.json({ status: "success", data: profile });

  } catch (error) {
    next(error);
  }
};
