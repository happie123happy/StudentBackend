import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const quizSchema = new Schema({
  name: String,
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  easy: [
    {
      question: String,
      options: [String],
      correctOption: Number,
    },
  ],
  medium: [
    {
      question: String,
      options: [String],
      correctOption: Number,
    },
  ],
  hard: [
    {
      question: String,
      options: [String],
      correctOption: Number,
    },
  ],
});

const ktSchema = new Schema({
  instId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  easy: [
    {
      question: String,
      options: [String],
      correctOption: String,
    },
  ],
  medium: [
    {
      question: String,
      options: [String],
      correctOption: String,
    },
  ],
  hard: [
    {
      question: String,
      options: [String],
      correctOption: String,
    },
  ],
});

const subModuleSchema = new Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  order: Number,
  name: String,
  content: {
    type: String,
    default: " ",
  },
  easy: {
    type: String,
    default: " ",
  },
  medium: {
    type: String,
    default: " ",
  },
  hard: {
    type: String,
    default: " ",
  },
  examples: [String],
  ytLinks: [String],
  articleLinks: [String],
});

const moduleSchema = new Schema({
  order: Number,
  moduleName: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  instId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  subModules: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubModule",
    },
  ],
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
});

moduleSchema.pre("remove", async function (next) {
  const subModule = mongoose.model("SubModule");
  await subModule.deleteMany({ _id: { $in: this.subModules } });
  console.log("Submodules deleted : ", this._id);
  const Quiz = mongoose.model("Quiz");
  await Quiz.deleteOne({ _id: this.quizId });
  console.log("Quiz deleted : ", this._id);

  next();
});

const courseSchema = new Schema({
  instId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },

  target: String,
  duration: String,
  courseOn: String,
  dummyOutline: {
    type: String,
    default: "{}",
  },
  status: {
    type: String,
    default: "editing",
  },
  prereq: [String],
  outline: {
    courseTitle: String,
    courseDescription: String,
    courseObjective: [String],
    courseTags: [String],
    courseStructure: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
  },

  kt: {
    type: mongoose.Schema.ObjectId,
    ref: "KT",
  },
});


courseSchema.pre("remove", async function (next) {
  const Module = mongoose.model("Module");
  await Module.deleteMany({ _id: { $in: this.outline.courseStructure } });
  console.log("Modules deleted : ", this._id);

  const Kt = mongoose.model("KT");
  await Kt.deleteOne({ _id: this.Kt });
  console.log("Kt deleted : ", this._id);

  next();
});


const publishSchema = new Schema({
  instId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    unique:true,
    required: true,
  },
});


const Course = model("Course", courseSchema);
const Module = model("Module", moduleSchema);
const SubModule = model("SubModule", subModuleSchema);
const Quiz = model("Quiz", quizSchema);
const Kt = model("KT", ktSchema);
const Publish = model("Publish", publishSchema);

export { Course, Module, SubModule, Quiz, Kt, Publish };
