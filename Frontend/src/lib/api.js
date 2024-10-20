import API from "../config/apiClient";

export const login = async (data) => {
  return await API.post("/user/login", data);
};

export const logout = async () => {
  return await API.post("/user/logout");
};

export const register = async (data) => {
  console.log(data);
  return await API.post("/user/register", data);
};

export const verifyEmail = async (code) => {
  return await API.get(`/user/email/verify/${code}`);
};

export const sendPasswordResetEmail = async (email) => {
  return await API.post("/user/password/forgot", { email });
};

export const resetPassword = async ({ verificationCode, password }) => {
  return await API.post("/user/password/reset", { verificationCode, password });
};

// User API
export const getUser = async () => {
  return await API.get("/user/");
};

export const getCourses = async () => {
  return await API.get("/courses");
};

// Course API
// createLessonPlans
// startCourse
// getLessons
// getLessonPlan
// getLessonContent
export const createLessonPlans = async (data) => {
  return await API.post("course/", data);
};

export const startCourse = async (data) => {
  /*
  Sample data: {
    "FinalPlan": {
      "Plan": [
          {
            "subtopics": [
              {
                "title": "Introduction to strings and character manipulation"
              },
              {
                "title": "Input and output with strings"
              },
              {
                "title": "String concatenation and comparison"
              },
              {
                "title": "Accessing characters and substrings"
              }
            ],
            "topic": "Strings"
          },
          {
            "subtopics": [
              {
                "title": "Introduction to vectors and their properties"
              },
              {
                "title": "Creating, accessing, and modifying vectors"
              },
              {
                "title": "Iterators and vector traversal"
              },
              {
                "title": "Common vector operations (insertion, deletion, resizing)"
              }
            ],
            "topic": "Vectors"
          },
        ],
        "Title" : "C++ STL for DSA Moderately paced"
    },
    "startDate": "2024-10-19", // When the user clicks on start Course
    "level": "Moderate",    
    "goal": "Learn C++ STL for DSA",
    "dailyStudyTime": "1 hr",
  }
  
  */
 console.log("Course Data: ",data);
  return await API.post("course/start", data);
};

export const getLessonPlan = async (courseId) => {
  return await API.get(`course/${courseId}`);
};

export const getLessonContent = async (lessonPlanId, subtopic) => {
  return await API.get(`course/${lessonPlanId}/${subtopic}`);
};
