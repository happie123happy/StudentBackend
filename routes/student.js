import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();
//import controllers
import {
  createCourse,
  addCourseOutline,
  getCourse,
  getCourses,
  deleteCourse,
  getCourseOutline,
  generateKt,
  updateKtE,
  updateKtM,
  updateKtH,
  publishCourse,
} from "../controllers/course/index.js";


//routes
router.use(auth);


// get full course
router.get("/:courseId", getCourse);

// save course outline and go to next
router.post("/savecourseoutline", addCourseOutline);

// publish course
router.post("/publish/:courseId", publishCourse);

router.post("/registercourse", addModule);

router.get("/getcourses", getCourses);
router.delete("/deletecourse", deleteCourse);


export default router;