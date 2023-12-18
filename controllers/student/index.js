import { Student } from "../../models/student/index.js";
import { ErrorResponse } from "../../utils/error.js";


export const updateProfile = async (req, res, next) => {
    const { profile } = req.body;
  try {
const stud = await Student.findByIdAndUpdate(req.user.id,{profile});
if (!stud) {
  return next(new ErrorResponse("Student not found", 404));
      }

      res.json({ status: "success", data: profile });

  } catch (error) {
    next(error);
  }
};

export const ktLogic = async (ktUser,ktSystem) => {
  try {
    let kts = {
      easy:{},
      medium:{},
      hard:{}
    };

    for (const ques of ktSystem.easy) {
      kts.easy[ques._id]=ques.correctOption
    }
    for (const ques of ktSystem.medium) {
      kts.medium[ques._id]=ques.correctOption
    }
    for (const ques of ktSystem.hard) {
      kts.hard[ques._id]=ques.correctOption
    }

    let easy_correct = 0;
    let medium_correct = 0;
    let hard_correct = 0;

    let easy_attempted = 0;
    let medium_attempted = 0;
    let hard_attempted = 0;
    let total_attempted = 0;

    let w_easy = 0.4;
    let w_medium = 0.3;
    let w_hard = 0.3;


    for (const ques of ktUser) {
      console.log(ques)
      if (ques.difficulty == "easy") {
        easy_attempted += 1;
        if (ques.option == kts["easy"][ques._id]) {
          easy_correct += 1;
        }
      }
      else if(ques.difficulty=="medium"){
        medium_attempted += 1;
        if (ques.option == kts["medium"][ques._id]) {
          medium_correct += 1;
        }
      }
      else if (ques.difficulty == "hard"){
        hard_attempted += 1;
        if (ques.option == kts["hard"][ques._id]) {
          hard_correct += 1;
        }
      }
      total_attempted += 1;
    }

    const per_easy = (easy_correct / easy_attempted) * 100;
    const per_medium = (medium_correct / medium_attempted) * 100;
    const per_hard = (hard_correct / hard_attempted) * 100;

    const levelPercentage = (w_easy * per_easy) + (w_medium * per_medium) + (w_hard * per_hard);


    if (levelPercentage <= 60) {
      return {
        easy_correct,
        per_easy,
        per_medium,
        per_hard,
        medium_correct,
        hard_correct,
        level:"1"
      };
    }
    else if (levelPercentage >= 60 && levelPercentage <= 80) {
return {
  easy_correct,
  per_easy,
  per_medium,
  per_hard,
  medium_correct,
  hard_correct,
  level: "2",
};    }
    else {
return {
  easy_correct,
  per_easy,
  per_medium,
  per_hard,
  medium_correct,
  hard_correct,
  level: "3",
};    }

  } catch (error) {
    console.log(error);
  }
};


