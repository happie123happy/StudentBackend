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
import {
  writeSubModuleContent,
  writeSubModuleContentE,
  writeSubModuleContentM,
  writeSubModuleContentH,
  generateSubModuleContent,
  generateEMHSubModuleContent,
} from "../controllers/course/coursesubmodule.js";

import {
  addModule,
  generateQuiz,
  updateQuizE,
  updateQuizH,
  updateQuizM,
} from "../controllers/course/coursemodule.js"

//routes
router.use(auth);

// after taking courseOn, target, duration
router.post("/createcourse", createCourse);
router.post("/getcourseoutline", getCourseOutline);
router.post("/:courseId/kt", generateKt);
router.post("/:courseId/kt/e", updateKtE);
router.post("/:courseId/kt/m", updateKtM);
router.post("/:courseId/kt/h", updateKtH);

// get full course
router.get("/:courseId", getCourse);

// save course outline and go to next
router.post("/savecourseoutline", addCourseOutline);

// publish course
router.post("/publish/:courseId", publishCourse);

router.post("/addmodule", addModule);

router.get("/getcourses", getCourses);
router.delete("/deletecourse", deleteCourse);

router.get("/:courseId/:moduleId/quiz", generateQuiz);
router.get("/:courseId/:moduleId/:id", generateSubModuleContent);
router.get(
  "/:courseId/:moduleId/:id/emh",
  generateEMHSubModuleContent
  );

  
router.put("/:courseId/:moduleId/quiz/e", updateQuizE);
router.put("/:courseId/:moduleId/quiz/m", updateQuizM);
router.put("/:courseId/:moduleId/quiz/h", updateQuizH);
router.put("/:courseId/:moduleId/:id", writeSubModuleContent);
router.put("/:courseId/:moduleId/:id/easy", writeSubModuleContentE);
router.put("/:courseId/:moduleId/:id/medium", writeSubModuleContentM);
router.put("/:courseId/:moduleId/:id/hard", writeSubModuleContentH);

export default router;