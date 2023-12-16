import { Course, Module, Quiz, SubModule } from "../../models/course/index.js";
import { getQuizAi } from "./courseAi.js";



export const addModule = async (req, res, next) => {
  const { courseId, moduleName, order } = req.body;

  try {
    const course = await Course.findById(courseId);
    const newModule = await Module.create({
      order: order,
      moduleName: moduleName,
      instId: req.user.id,
      courseId: course._id, // Include courseId in Module
      subModules: [],
      quiz: "",
    });

    res.json({ status: "success", data: newModule });
  } catch (error) {
    next(error);
  }
};





export const generateQuiz = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const module = await Module.findById(req.params.moduleId);
    const moduleData = await module.populate([
      {
        path: "subModules",
        model: "SubModule",
        select: "name",
      },
      { path: "quizId", model: "Quiz" },
    ]);
    const subModules = moduleData.subModules.map((item) => item.name);
    console.log(moduleData);

    if (moduleData.quizId.easy.length !== 0) {
      res.json({ status: "success", data: moduleData.quizId });
      return;
    }

    const content = await getQuizAi(
      course.courseOn,
      course.target,
      course.duration,
      module.moduleName,
      subModules
    );

    const quiz = await Quiz.updateOne(
      { _id: moduleData.quizId },
      {
        easy: content.easy,
        medium: content.medium,
        hard: content.hard,
      }
    );

    res.json({
      status: "success",
      data: {
        quiz,
        easy: content.easy,
        medium: content.medium,
        hard: content.hard,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuizE = async (req, res, next) => {
  const { content } = req.body;

  try {
    const module = await Module.findById(req.params.moduleId);

    const quiz = await Quiz.updateOne(
      { _id: module.quizId },
      {
        easy: content,
      }
    );

    res.json({
      status: "success",
      data: {
        quiz,
        easy: content,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuizM = async (req, res, next) => {
  const { content } = req.body;

  try {
    const module = await Module.findById(req.params.moduleId);

    const quiz = await Quiz.updateOne(
      { _id: module.quizId },
      {
        medium: content,
      }
    );

    res.json({
      status: "success",
      data: {
        quiz,
        medium: content,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuizH = async (req, res, next) => {
  const { content } = req.body;

  try {
    const module = await Module.findById(req.params.moduleId);

    const quiz = await Quiz.updateOne(
      { _id: module.quizId },
      {
        hard: content,
      }
    );

    res.json({
      status: "success",
      data: {
        quiz,
        hard: content,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizData = async (req, res, next) => {
  const { quizId } = req.body;

  try {
    const quiz = await Module.findById(quizId);

    res.json({
      status: "success",
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};
