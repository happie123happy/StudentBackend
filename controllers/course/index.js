import { ErrorResponse } from "../../utils/error.js";
import {
  Course,
  Kt,
  Module,
  Publish,
  Quiz,
  SubModule,
} from "../../models/course/index.js";
import { Instructor, Student } from "../../models/student/index.js";
import { ktLogic } from "../student/index.js";
import { getArticleAI, getYTAI } from "./courseAi.js";

export const displayAllCourses = async (req, res, next) => {
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

    const course = await Course.find({ status: "published" })
      .populate({
        path: "instId",
        model: "Instructor",
        select: ["profile.firstname", "profile.bio", "profile.address.country"],
      })
      .select([
        "-dummyOutline",
        "-outline.courseStructure",
        "-outline.courseDescription",
        "-outline.courseObjective",
      ]);

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

    if (!course) {
      return next(new ErrorResponse("Course not found", 404));
    }

    const pcourse = await course.outline.populate({
      path: "courseStructure",
      populate: [
        {
          path: "subModules",
          model: "SubModule",
          select:"name _id"
        },
        {
          path: "quizId",
          model: "Quiz",
          select:"name _id"
        },
      ],
    });

     const user = await Student.findById(req.user.id);
     if (!user) {
       return next(new ErrorResponse("User not found", 404));
      }
      
      const cindex = user.courses.findIndex((item) => item.course == req.params.courseId);
      if (cindex==-1) {
      return next(new ErrorResponse("course not found", 404));
    }

    // console.log(user.courses)
    // console.log(cindex)
    const modAcc = user.courses[cindex].modules;



    // console.log(pcourse);
    res.json({ status: "success",modules:modAcc, data: pcourse });
  } catch (error) {
    next(error);
  }
};

// dashboard of courses after login
export const getAllCourses = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const course = await Course.find({ status: "published" })
      .populate({
        path: "instId",
        model: "Instructor",
        select: ["profile.firstname", "profile.bio", "profile.address.country"],
      })
      .select([
        "-dummyOutline",
        "-outline.courseStructure",
        "-outline.courseDescription",
        "-outline.courseObjective",
      ]);

    let accessData = {};

    for (const mod of course) {
      accessData[mod._id] = {
        isRegistered: false,
        data: {
          outline: mod.outline,
          target: mod.target,
          duration: mod.duration,
          courseOn: mod.courseOn,
        },
      };
    }

    for (const mod of user.courses) {
      const d = accessData[mod.course];
      const ktlen = mod.kt.length;
      accessData[mod.course] = {
        isRegistered: true,
        ktDone:ktlen!=0,
        data: {
          outline: d.data.outline,
          target: d.data.target,
          duration: d.data.duration,
          courseOn: d.data.courseOn
        }
      };
    }

    res.json({ status: "success", data: accessData });
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

// get registered courses
export const getCourses = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    const courses = await user.populate({
      path: "courses",
      model: "Course",
      populate: {
        path: "course",
        model: "Course",
        select: [
          "-dummyOutline",
          "-outline.courseDescription",
          "-outline.courseStructure",
          "-outline.courseObjective",
        ],
        populate: {
          path: "instId",
          model: "Instructor",
          select: [
            "profile.firstname",
            "profile.bio",
            "profile.address.country",
          ],
        },
      },
    });
    console.log("get courses successful");
    res.json({ status: "success", data: courses.courses });
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

    const alreadyRegistered = user.courses.find(
      (item) => item.course == courseId
    );

    if (alreadyRegistered) {
      return next(new ErrorResponse("Already Registered", 404));
    }

    const course = await Course.findById(courseId).select(
      "outline.courseStructure"
    );
    if (!course) {
      return next(new ErrorResponse("Course not found", 404));
    }

    const accessMod = course.outline.courseStructure.map((item, index) => {
      console.log(item)
      if (index == 0) {
        return {
          moduleId: item,
          access: true,
        };
      } else {
        return {
          moduleId: item,
          access: false,
        };
      }
    });

    console.log(accessMod);

    const arr = user.courses;
  
    arr.push({ course: courseId, modules: accessMod });
    user.courses = arr;
    await user.save();

    res.json({ status: "success", courseId: courseId, data: accessMod });
  } catch (error) {
    next(error);
  }
};

export const getCourseContent = async (req, res, next) => {
  const { subModuleId, moduleId } = req.body;
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const access = user.courses.find(
      (item) => item.course == req.params.courseId
    );

    if (!access) {
      return next(new ErrorResponse("unauthorized to access course", 404));
    }

    let accMod = access.modules.find(
      (item) => item.access && item.moduleId == moduleId
    );
    console.log(accMod);
    if (!accMod) {
      return next(new ErrorResponse("No Access or Invalid Module", 404));
    }

    if (accMod.level == "easy") {
      accMod = accMod.level;
    }
    else if (accMod.level == "medium") {
      accMod = "medium";
    }
    else {
      accMod = "hard";
    }

    const submodule = await SubModule.findOne({_id:subModuleId,moduleId:moduleId}).select(accMod);

    if (!submodule) {
      return next(new ErrorResponse("content not found", 404));
    }

    // console.log(pcourse);
    res.json({ status: "success",level:accMod, data: submodule });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const access = user.courses.find(
      (item) => item.course == req.params.courseId
    );

    if (!access) {
      return next(new ErrorResponse("unauthorized to access course", 404));
    }

    let accMod = access.modules.filter((item) => item.access);
    accMod = accMod.map((item) => ({
      moduleId: item.moduleId,
      level: item.level, // Get the level associated with each module
    }));

    console.log(accMod);
    // const accLevel = 0;

    const course = await Course.findOne({
      _id: req.params.courseId,
    })
      .populate([
        {
          path: "instId",
          model: "Instructor",
          select: [
            "profile.firstname",
            "profile.bio",
            "profile.address.country",
          ],
        },
        {
          path: "outline.courseStructure",
          model: "Module",
          match: { _id: { $in: accMod.map((item) => item.moduleId) } },

          populate: [
            {
              path: "subModules",
              module: "SubModule",
              select: ["name"],
            },
            {
              path: "quizId",
              module: "Quiz",
              select: ["name"],
            },
          ],
        },
      ])
      // .select(["dummyOutline"]);

    if (!course) {
      return next(new ErrorResponse("Course not found", 404));
    }

    // console.log(pcourse);
    res.json(course);
  } catch (error) {
    next(error);
  }
};

export const getKt = async (req, res, next) => {
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const course = await Course.findOne({
      $and: [{ _id: req.params.courseId }, { kt: { $exists: true } }],
    })
      .populate({
        path: "kt",
        model: "KT",
        select: "-easy.correctOption -medium.correctOption -hard.correctOption",
        // select: "easy._id medium._id hard._id easy.correctOption medium.correctOption hard.correctOption",
      })
      .select(["kt"]);

    //   const ktSystem = course.kt;
    //   const resp = [];

    //   for (const ques of ktSystem.easy) {
    //   resp.push({difficulty:"easy",option:ques.correctOption,_id:ques._id})
    // }
    // for (const ques of ktSystem.medium) {
    //     resp.push({difficulty:"medium",option:ques.correctOption,_id:ques._id})
    //   }
    //   for (const ques of ktSystem.hard) {
    //     resp.push({difficulty:"hard",option:ques.correctOption,_id:ques._id})
    //   }

    if (!course) {
      return next(new ErrorResponse("Knowledge Test/Course Not Found", 404));
    }

    // console.log(pcourse);
    // res.json(resp);
    res.json({status:"success",data:course});
  } catch (error) {
    next(error);
  }
};

export const getQt = async (req, res, next) => {
  try {

    // const user = await Student.findById(req.user.id);
    // if (!user) {
    //   return next(new ErrorResponse("User not found", 404));
    // }

    const module = await Module.findOne({
      $and: [{ _id: req.params.moduleId }, {courseId:req.params.courseId}, { quizId: { $exists: true } }],
    })
      .populate({
        path: "quizId",
        model: "Quiz",
        select: "-easy.correctOption -medium.correctOption -hard.correctOption",
        // select: "easy._id medium._id hard._id easy.correctOption medium.correctOption hard.correctOption",
      })
      .select(["quizId"]);
    
  //   const ktSystem = module.quizId;
  //   const resp = [];
    
  //   for (const ques of ktSystem.easy) {
  //   resp.push({difficulty:"easy",option:ques.correctOption,_id:ques._id})
  // }
  // for (const ques of ktSystem.medium) {
  //     resp.push({difficulty:"medium",option:ques.correctOption,_id:ques._id})
  //   }
  //   for (const ques of ktSystem.hard) {
  //     resp.push({difficulty:"hard",option:ques.correctOption,_id:ques._id})
  //   }
    
    if (!module) {
      return next(new ErrorResponse("Quiz Test/Module Not Found", 404));
    }

    // console.log(course);
    // res.json(resp);
    res.json({status:"success",data:module});
  } catch (error) {
    next(error);
  }
};

export const getYt = async (req, res, next) => {
  try {

    const submodule = await SubModule.findOne({
      _id: req.params.id
    })
      .select(["_id","name", "ytLinks"]);
    
    
    if (!submodule) {
      return next(new ErrorResponse("submodule Not Found", 404));
    }
    
    if (submodule.ytLinks.length!=0) {
      res.json({status:"success",data:submodule});
      return;
    }
    
    const content = await getYTAI(submodule.name);
    if (!content) {
      return next(new ErrorResponse("Content Not Found", 404));
    }

    submodule.ytLinks = content
    await submodule.save();
  
    res.json({status:"success",data:submodule});
  } catch (error) {
    next(error);
  }

};

export const getArticles = async (req, res, next) => {
  try {

    const submodule = await SubModule.findOne({
      _id: req.params.id
    })
      .select(["_id","name", "articleLinks"]);
    
    
    if (!submodule) {
      return next(new ErrorResponse("submodule Not Found", 404));
    }
    
    if (submodule.articleLinks.length!=0) {
      res.json({status:"success",data:submodule});
      return;
    }
    
    const content = await getArticleAI(submodule.name);
    if (!content) {
      return next(new ErrorResponse("Content Not Found", 404));
    }
    // console.log(content)

    submodule.articleLinks = content.search_results
    await submodule.save();
  
    res.json({status:"success",data:submodule});
  } catch (error) {
    next(error);
  }

};

export const submitKt = async (req, res, next) => {
  const { kt } = req.body;
  const courseId = req.params.courseId;
  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // const alreadyRegistered = user.courses.find(
    //   (item) => item.course == courseId
    // );
    // if (alreadyRegistered) {
    //   return next(new ErrorResponse("Already Registered", 404));
    // }

    const cIndex = user.courses.findIndex((x) => x.course == courseId);
    if (cIndex != -1) {

          const course = await Course.findById(courseId)
            .select("outline kt")
            .populate({
              path: "kt",
              model: "KT",
              select:
                "easy._id medium._id hard._id  easy.correctOption medium.correctOption hard.correctOption",
            });

          if (!course) {
            return next(new ErrorResponse("Course not found", 404));
          }
      
      const ktlevel = await ktLogic(kt, course.kt);
      const klevel =
        ktlevel.level == "1"
          ? "easy"
          : ktlevel.level == "2"
          ? "medium"
            : "hard";
      
      console.log(ktlevel);
      const accessMod = course.outline.courseStructure.map((item, index) => {
        if (index == 0) {
          return {
            moduleId: item,
            access: true,
            level: klevel,
          };
        } else {
          return {
            moduleId: item,
            access: false,
            level: "easy",
          };
        }
      });

      user.courses[cIndex].course = courseId;
      user.courses[cIndex].modules = accessMod;
      user.courses[cIndex].kt = kt;
      await user.save();
      
      res.json({
            status: "success",
            courseId: courseId,
            data: ktlevel,
          });
      return;
    }

    const course = await Course.findById(courseId).select("outline kt").populate({
      path: "kt",
      model: "KT",
      select:
        "easy._id medium._id hard._id  easy.correctOption medium.correctOption hard.correctOption",
    });

    if (!course) {
      return next(new ErrorResponse("Course not found", 404));
    }

    const ktlevel = await ktLogic(kt, course.kt);
    const klevel = ktlevel.level == "1" ? "easy" : ktlevel.level == "2" ? "medium" : "hard";

    console.log(ktlevel)
    const accessMod = course.outline.courseStructure.map((item, index) => {
      if (index == 0) {
        return {
          moduleId: item,
          access: true,
          level:klevel
        };
      } else {
        return {
          moduleId: item,
          access: false,
          level:"easy"
        };
      }
    });

    user.courses.push({ course: courseId, modules: accessMod,kt:kt });
    await user.save();

    // user.courses = user.courses.map((item) => {
    //   if (item.course == courseId) {
    //     item.modules = item.modules.map((mod) => {
    //       return {
    //         ...mod,
    //         level: klevel
    //       }
    //     })
    //     return {
    //       ...item,
    //       kt
    //     }
    //   }
    //   else {
    //     return item
    //   }
    // });

    // await user.save();


    res.json({ status: "success", courseId:courseId,data: ktlevel });

    // res.json({ status: "success", data: course });

  } catch (error) {
    next(error);
  }

};

export const submitQt = async (req, res, next) => {
  const { qt } = req.body;
  const courseId = req.params.courseId;
  const moduleId = req.params.moduleId;

  try {
    const user = await Student.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // const alreadyRegistered = user.courses.find(
    //   (item) => item.course == courseId
    // );
    // if (alreadyRegistered) {
    //   return next(new ErrorResponse("Already Registered", 404));
    // }

    const module = await Module.findById(moduleId)
      .select("quizId")
      .populate({
        path: "quizId",
        model: "Quiz",
        select:
          "easy._id medium._id hard._id  easy.correctOption medium.correctOption hard.correctOption",
      });

    if (!module) {
      return next(new ErrorResponse("module not found", 404));
    }

    const qtlevel = await ktLogic(qt, module.quizId);
    const qlevel = qtlevel.level == "1" ? "easy" : qtlevel.level == "2" ? "medium" : "hard";
    
    const cIndex = user.courses.findIndex(x => x.course == courseId);
    const mIndex = user.courses[cIndex].modules.findIndex((x) => x.moduleId == moduleId);
    const mlen = user.courses[cIndex].modules.length;
    if (mIndex + 1 < mlen) {
      user.courses[cIndex].modules[mIndex + 1].level = qlevel;
      user.courses[cIndex].modules[mIndex + 1].access = true;
      await user.save();
    }


    res.json({ status: "success", moduleId: moduleId, data: qtlevel });

    // res.json({ status: "success", data: course });
  } catch (error) {
    next(error);
  }
};



export const getAnalytics = async (req, res, next) => {
  try {

    const user = await Student.findById(req.user.id);
    if (!user) {
      next(new ErrorResponse("User not found",400))
    }

    const findCourseProgress = (modules) => {
      console.log(modules)
      const modLen = modules.length;
      const isaccessable = modules.filter((item) => item.access);
      return (isaccessable.length/modLen)*100
      // const 
    }

    const coursesEnrolled = user.courses.length;
    const courseProgress = user.courses.map((item, i) => {
      // console.log(user)
      const coursePro = findCourseProgress(item.modules);
      return {
        courseId: item.course,
        progress: coursePro
      }
    });

    res.json({
      enrolled:coursesEnrolled,
      progress:courseProgress
    })


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
