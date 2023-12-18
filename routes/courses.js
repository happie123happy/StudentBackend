import express from "express";

const router = express.Router();
//import controllers
import {
  displayAllCourses,
  getCourseDetails,
} from "../controllers/course/index.js";

// find courses
router.get("/", displayAllCourses);

// get course details
router.get("/:courseId", getCourseDetails);


export default router;
