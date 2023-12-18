import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();
//import controllers
import {
  getAllCourses,
  getCourse,
  getCourseContent,
  getCourseDetails,
  getCourses,
  getKt,
  getQt,
  registerCourse,
  submitKt,
  submitQt,

} from "../controllers/course/index.js";
import { updateProfile } from "../controllers/student/index.js";


//routes
router.use(auth);

// update profile
router.post("/updateprofile", updateProfile);

// find my courses
router.get("/getcourses", getCourses);

// find all courses
router.get("/allcourses", getAllCourses);

// get course details
router.get("/getcoursedetails", getCourseDetails);

// course register
router.post("/registercourse", registerCourse);

// get full course
router.get("/course/:courseId", getCourse);

// post content from course
router.post("/getcoursecontent/:courseId", getCourseContent);

// get kt from course
router.get("/getkt/:courseId", getKt);

// get qt from course
router.get("/getqt/:courseId/:moduleId", getQt);

// submit kt from course
router.post("/submitkt/:courseId", submitKt);

// submit quiztest from course
router.post("/submitqt/:courseId/:moduleId", submitQt);




export default router;