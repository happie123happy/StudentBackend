import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();
//import controllers
import {
  getAllCourses,
  getCourse,
  getCourseDetails,
  getCourses,
  registerCourse,

} from "../controllers/course/index.js";
import { updateProfile } from "../controllers/student/index.js";


//routes
router.use(auth);

// update profile
router.post("/updateprofile", updateProfile);

// find my courses
router.get("/getcourses", getCourses);

// get course details
router.get("/getcoursedetails", getCourseDetails);

router.post("/registercourse", registerCourse);


// get full course
router.get("/course/:courseId", getCourse);




export default router;