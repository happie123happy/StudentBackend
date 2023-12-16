import { ErrorResponse } from "../../utils/error.js";
import { Course, Kt, Module, Publish, Quiz, SubModule } from "../../models/course/index.js";
import { Instructor } from "../../models/instructor/index.js";
import { getCourseOutlineAi,getKt } from "./courseAi.js";

const createCourse = async (req, res, next) => {
  const { target, duration, courseOn } = req.body;

  try {
    const course1 = await Course.findOne({ target, duration, courseOn,"instId":req.user.id });
    if (course1) {
      console.log(course1.dummyOutline);
    }
    if (course1 && (course1.outline.courseTags.length!=0 || course1.dummyOutline !==" ")) {
      console.log(course1);
      res
        .status(200)
        .json({ courseData: JSON.parse(course1.dummyOutline), courseId: course1._id });
      return;
    }

    let course;
    if (course1) {
      course = course1;
    }
    else { 
      course = await Course.create({
        instId: req.user.id,
        target,
        duration,
        courseOn,
      });
    }

    const outline = await getCourseOutlineAi(courseOn, target, duration);
      
    // let [course, outline] = await Promise.all([
    //   Course.create({
    //     instId: req.user.id,
    //     target,
    //     duration,
    //     courseOn,
    //   }),
    //   getCourseOutlineAi(courseOn, target, duration),
    // ]);

    course.dummyOutline = JSON.stringify(outline);
    await course.save();
    
    const user = await Instructor.findById(req.user.id);
    user.courses.push(course._id);
    await user.save();

    console.log(course);

    res.status(200).json({"courseData":outline,"courseId":course._id});
  } catch (error) {
    next(error);
  }
};

export const getCourseOutline = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    const resp = JSON.parse(course.dummyOutline);
    res.json(resp);
  } catch (error) {
    next(error);
  }
};

const addCourseOutline = async (req, res, next) => {
  const { courseId, courseData } = req.body;

  try {
    const newCourse = await Course.findById(courseId);
    if (!newCourse) {
      return next(new ErrorResponse("Course not found", 404));
    }

    newCourse.outline = {
      courseTitle: courseData.courseTitle,
      courseDescription: courseData.courseDescription,
      courseObjective: courseData.courseObjective,
      courseTags: courseData.courseTags,
      courseStructure: [],
    };

    // Create Modules and Submodules and associate them with the Course
    for (const moduleData of courseData.courseStructure) {
      const newModule = await Module.create({
        order: courseData.courseStructure.indexOf(moduleData) + 1,
        moduleName: moduleData.moduleName,
        instId: req.user.id,
        courseId: newCourse._id, // Include courseId in Module
        subModules: [],
        quiz: "",
      });

      const quiz = await Quiz.create({
        name: moduleData.quiz,
        moduleId: newModule._id,
      });

      newModule.quizId = quiz._id;

      for (const subModuleName of moduleData.subModules) {
        const newSubModule = await SubModule.create({
          order: moduleData.subModules.indexOf(subModuleName) + 1,
          name: subModuleName,
          moduleId: newModule._id, // Include moduleId in Submodule
        });

        newModule.subModules.push(newSubModule._id);
      }

      // Save Module and push its ID to Course's courseStructure array
      await newModule.save();
      newCourse.outline.courseStructure.push(newModule._id);
    }

    newCourse.dummyOutline = JSON.stringify(courseData);

    // Save the Course with all associated Modules and Submodules
    await newCourse.save();
    const pcourse = await newCourse.outline.populate({
      path: "courseStructure",
      populate: {
        path: "subModules",
        model: "SubModule",
      },
    });

    console.log(pcourse);
    res.json(pcourse);

  } catch (error) {
    next(error);
  }
};





export const deleteCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    // const newCourse = await Course.findById(courseId);
    // if (!newCourse) {
    //   return next(new ErrorResponse("Course not found", 404));
    // }

    // const courseData = newCourse.outline;

    // // delete modules from course
    // for (const moduleData of courseData.courseStructure) {
    //   // delete quiz of each module
    //   console.log("Deleted Quiz : ",moduleData.quizId)
      
      
    //   for (const subModuleName of moduleData.subModules) {
    //     //delete submodule of each module
    //     console.log("Deleted submodule : ",subModuleName)
    //   }
      
    //   console.log("Deleted Module : ",moduleData)
    // }
    
    // // delete course
    // console.log("Deleted Course : ")

    const course = await Course.deleteOne({_id:courseId});

    res.json(course);
  } catch (error) {
    next(error);
  }
};






const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({
      _id: req.params.courseId,
      instId: req.user.id,
    });

    const pcourse = await course.outline.populate({
      path: "courseStructure",
      populate: [{
        path: "subModules",
        model: "SubModule",
      }, {
      path: "quizId",
      model:"Quiz"
        }]
      }
      );

    // console.log(pcourse);
    res.json(pcourse);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const user = await Instructor.findById(req.user.id);

    const courses = await user.populate("courses");

    console.log(courses);
    res.json(courses);
  } catch (error) {
    next(error);
  }
};




export const generateKt = async (req, res, next) => {
  const { prereq } = req.body;
  try {
    const course = await Course.findOne({
      $and: [{ _id: req.params.courseId }, { kt: { $exists: false } }]
    });


    if (!course) {
      const course = await Course.findById(req.params.courseId);
      const courseData = await course.populate({
        path: "kt",
        model: "Kt"
      });

      res.json({
        status: "success",
        data: courseData.kt
      });

      return;
    }

    const content = await getKt(
      course.courseOn,
      course.target,
      prereq
    );

    // console.log(content)

    const kt = await Kt.create({ instId: req.user.id, courseId: course._id, easy: content.easy, medium: content.medium, hard: content.hard });
    course.kt = kt._id;

    await course.save();

    res.json({
      status: "success",
      data: kt
    });
  } catch (error) {
    next(error);
  }
};

export const updateKtE = async (req, res, next) => {
  const { content } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);

    const kt = await Kt.updateOne(
      { _id: course.kt },
      {
        easy: content,
      }
    );

    res.json({
      status: "success",
      data: {
        kt,
        easy: content,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateKtM = async (req, res, next) => {
  const { content } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);

    const kt = await Kt.updateOne(
      { _id: course.kt },
      {
        medium: content,
      }
    );

    res.json({
      status: "success",
      data: {
        kt,
        easy: content,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateKtH = async (req, res, next) => {
  const { content } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);

    const kt = await Kt.updateOne(
      { _id: course.kt },
      {
        hard: content,
      }
    );

    res.json({
      status: "success",
      data: {
        kt,
        easy: content,
      },
    });
  } catch (error) {
    next(error);
  }
};




export const publishCourse = async (req, res, next) => {
  
  try {
    const pub = await Publish.create({ instId: req.user.id, courseId: req.params.courseId });

    res.json({
      status: "success",
      data: pub
    });

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



export { createCourse, addCourseOutline,getCourse};
