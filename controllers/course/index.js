import { ErrorResponse } from "../../utils/error.js";
import {
  Course,
  Kt,
  Module,
  Publish,
  Quiz,
  SubModule,
} from "../../models/course/index.js";
import { Instructor,Student } from "../../models/student/index.js";

export const getAllCourses = async (req, res, next) => {
  try {
    // const course = await Course.find({ status: "published" }).populate({
    //   path: "outline.courseStructure",
    //   populate: [
    //     {
    //       path: "subModules",
    //       model: "SubModule",
    //       select:["name","order"]
    //     },
    //     {
    //       path: "quizId",
    //       model: "Quiz",
    //       select:"name"
    //     },
    //   ],
    // });

    const course = await Course.find({ status: "published" }).populate({
      path: "instId",
      model: "Instructor",
      select: ["profile.firstname", "profile.bio", "profile.address.country"],
    });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
    });

    const pcourse = await course.outline.populate({
      path: "courseStructure",
      populate: [
        {
          path: "subModules",
          model: "SubModule",
        },
        {
          path: "quizId",
          model: "Quiz",
        },
      ],
    });

    // console.log(pcourse);
    res.json({ status: "success", data: pcourse });
  } catch (error) {
    next(error);
  }
};












export const deleteCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const stud = await Student.findById(req.user.id);
    if (!stud) {
        return next(new ErrorResponse("Student not found", 404));
    }
    
    const course = await Course.deleteOne({ _id: courseId });

    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
    }).populate({
      path: "instId",
      model: "Instructor",
      select: ["profile.firstname", "profile.bio", "profile.address.country"],
    });

    // console.log(pcourse);
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    const courses = await user.populate({ path: "courses", model: "Course" });
    console.log("get courses successful");
    res.json({status:"success",data:courses.courses});
  } catch (error) {
    next(error);
  }
};



export const registerCourse = async (req, res, next) => {
  const { courseId } = req.body;
  try {
const user = await Student.findById(req.user.id);
if (!user) {
  return next(new ErrorResponse("User not found", 404));
    }
    
    user.courses.push(courseId);
    await user.save();

    res.json({ status:"success", data: courseId });


  } catch (error) {
    next(error);
  }
};



// export const  = async (req, res, next) => {
//   try {

//   } catch (error) {
//     next(error);
//   }
// };
