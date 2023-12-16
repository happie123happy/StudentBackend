import { Instructor } from "../models/instructor/index.js";

// CREATE CONTEXT MIDDLEWARE
const createContext = (req, res, next) => {
  // put any data you want in the object below to be accessible to all routes
  req.context = {
    models: {
      Instructor
    },
  };
  next();
};

export default createContext;