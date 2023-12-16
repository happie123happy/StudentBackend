import { Course, Module, Quiz, SubModule } from "../../models/course/index.js";
import {
  getSubModuleContentAi,
  getSubModuleContentAiE,
  getSubModuleContentAiM,
  getSubModuleContentAiH,
} from "./courseAi.js";

export const addSubModule = async (req, res, next) => {
  const { moduleId, subModuleName, order } = req.body;

  try {
    const module = await Module.findById(moduleId);

    const newSubModule = await SubModule.create({
      order: order,
      name: subModuleName,
      moduleId: module._id, // Include moduleId in Submodule
    });

    res.json({ status: "success", data: newSubModule });
  } catch (error) {
    next(error);
  }
};

// export const getSubModuleContent = async (req, res, next) => {
//   try {
//     const subModule = await SubModule.findById(req.params.id);
//     if (subModule.content !== "") {
//       res.json({ status: "success", data: subModule });
//       return
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const removeSubModule = async (req, res, next) => {
  const { moduleId, id } = req.body;
  try {
    const module = await Module.findById(moduleId);
    const subs = module.subModules.filter((sub) => sub != id);
    module.subModules = subs;
    await module.save();
    const subModule = await SubModule.deleteOne({ _id: id });
    res.json(subModule);
  } catch (error) {
    next(error);
  }
};

export const writeSubModuleContent = async (req, res, next) => {
  const { content } = req.body;
  try {
    const subModule = await SubModule.updateOne(
      { moduleId: req.params.moduleId, _id: req.params.id },
      { content }
    );
    res.json(subModule);
  } catch (error) {
    next(error);
  }
};

export const writeSubModuleContentE = async (req, res, next) => {
  const { content } = req.body;
  try {
    const subModule = await SubModule.updateOne(
      { moduleId: req.params.moduleId, _id: req.params.id },
      { easy: content }
    );
    res.json(subModule);
  } catch (error) {
    next(error);
  }
};

export const writeSubModuleContentM = async (req, res, next) => {
  const { content } = req.body;
  try {
    const subModule = await SubModule.updateOne(
      { moduleId: req.params.moduleId, _id: req.params.id },
      { medium: content }
    );
    res.json(subModule);
  } catch (error) {
    next(error);
  }
};

export const writeSubModuleContentH = async (req, res, next) => {
  const { content } = req.body;
  try {
    const subModule = await SubModule.updateOne(
      { moduleId: req.params.moduleId, _id: req.params.id },
      { hard: content }
    );
    res.json(subModule);
  } catch (error) {
    next(error);
  }
};

export const generateSubModuleContent = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const module = await Module.findById(req.params.moduleId);
    const subModule = await SubModule.findById(req.params.id);

    if (subModule.content !== " ") {
      res.json({ status: "success", data: subModule });
      return;
    }

    const content = await getSubModuleContentAi(
      course.courseOn,
      course.target,
      course.duration,
      module.moduleName,
      subModule.name
    );
    subModule.content = content.submodule_content;
    subModule.save();

    res.json({ status: "success", subModuleId: subModule._id, data: content });
  } catch (error) {
    next(error);
  }
};

export const generateEMHSubModuleContent = async (req, res, next) => {
  try {
    const subModule = await SubModule.findById(req.params.id);

    if (subModule.easy !== " ") {
      if (subModule.medium !== " ") {
        if (subModule.hard !== " ") {
          res.json({
            status: "success",
            subModuleId: subModule._id,
            easy: subModule.easy,
            medium: subModule.medium,
            hard: subModule.hard,
          });
          return;
        }

        const h = await getSubModuleContentAiH(
          subModule.name,
          subModule.content
        );
        subModule.hard = h;
        await subModule.save();

        res.json({
          status: "success",
          subModuleId: subModule._id,
          easy: subModule.easy,
          medium: subModule.medium,
          hard: subModule.hard,
        });
        return;
      } else {
        const m = await getSubModuleContentAiM(
          subModule.name,
          subModule.content
        );
        subModule.medium = m;
        await subModule.save();

        if (subModule.hard !== " ") {
          res.json({
            status: "success",
            subModuleId: subModule._id,
            easy: subModule.easy,
            medium: subModule.medium,
            hard: subModule.hard,
          });
          return;
        }

        const h = await getSubModuleContentAiH(
          subModule.name,
          subModule.content
        );
        subModule.hard = h;
        await subModule.save();

        res.json({
          status: "success",
          subModuleId: subModule._id,
          easy: subModule.easy,
          medium: subModule.medium,
          hard: subModule.hard,
        });
        return;
      }
    }

    let [e, m, h] = await Promise.all([
      getSubModuleContentAiE(subModule.name, subModule.content),
      getSubModuleContentAiM(subModule.name, subModule.content),
      getSubModuleContentAiH(subModule.name, subModule.content),
    ]);

    // const e = await getSubModuleContentAiE(subModule.name, subModule.content);

    subModule.easy = e;
    subModule.medium = m;
    subModule.hard = h;

    await subModule.save();

    res.json({
      status: "success",
      subModuleId: subModule._id,
      easy: subModule.easy,
      medium: subModule.medium,
      hard: subModule.hard,
    });
  } catch (error) {
    next(error);
  }
};

