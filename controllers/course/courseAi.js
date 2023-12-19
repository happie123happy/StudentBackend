



export const getArticleAI = async (topic) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_ARTICLES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
       topic
      }),
    });

    const data = await resp.json();
    return data;
  } catch (error) {
    console.log("Error: ",error);
  }
};

export const getKt = async (coursename, audience, prerequisitelist) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_KT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        coursename,
        audience,
        prerequisitelist
      }),
    });

    const data = await resp.json();
    return data;
  } catch (error) {
    console.log("Error: ",error);
  }
};

export const getPrerequisites = async (coursename) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_PREQ, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        coursename
      }),
    });

    const data = await resp.json();
    return data;
  } catch (error) {
    console.log("Error: ",error);
  }
};

export const getQuizAi = async (course, target, duration, module, submodules) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_Q, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        course: course,
        target: target,
        duration: duration,
        module: module,
        submodules:submodules
      }),
    });

    const data = await resp.json();
    return data;
  } catch (error) {
    console.log("Error: ",error);
  }
};



export const getCourseOutlineAi = async (course, target, duration) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        course: course,
        target: target,
        duration: duration,
      }),
    });

    const data = await resp.json();
    return data;
    
  } catch (error) {
    console.log("Error: ",error);
  }
};



export const getSubModuleContentAi = async (course, target, duration, module,submodulename) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_SC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        course,
        target,
        duration,
        module,
        submodulename,
      }),
    });

    const data = await resp.json();
    return data;
    
  } catch (error) {
    console.log("Error: ",error);
  }
};



export const getSubModuleContentAiE = async (submodulename,submodulecontent) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_E, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        submodulename,
        "description":submodulecontent
      }),
    });

    const data = await resp.json();
    // console.log(data.content);
    return data.content;
    
  } catch (error) {
    console.log("Error: ",error);
  }
};



export const getSubModuleContentAiM = async (
  submodulename,
  submodulecontent
) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_M, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        submodulename,
        description: submodulecontent,
      }),
    });

    const data = await resp.json();
    // console.log(data.content);
    return data.content;

  } catch (error) {
    console.log("Error: ",error);
  }
};

export const getSubModuleContentAiH = async (
  submodulename,
  submodulecontent
) => {
  try {
    // get course outline from AI
    const resp = await fetch(process.env.AI_URL_H, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        submodulename,
        description: submodulecontent,
      }),
    });

    const data = await resp.json();
    // console.log(data.content);
    return data.content;

  } catch (error) {
    console.log("Error: ",error);
  }
};



