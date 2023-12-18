import express from "express";

const router = express.Router();
//import controllers
import {
  getAllCourses,
  getCourseDetails,
} from "../controllers/course/index.js";

// find courses
router.get("/", getAllCourses);

// get course details
router.get("/:courseId", getCourseDetails);


export default router;
