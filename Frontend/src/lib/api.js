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

export const getCourses = async (courseIds) => {
  return await API.post("/courses/", courseIds);
};

export const createLessonPlans = async (data) => {
  return await API.post("courses/create", data);
};

export const startCourse = async (data) => {
  console.log("Course Data: ", data);
  return await API.post("courses/start", data);
};

export const getLessonPlan = async (courseId) => {
  return await API.get(`courses/${courseId}`);
};

export const markComplete = async (data) => {
  return await API.post(`progress/subtopic/complete`, data);
};

export const getKnowledgeCheck = async (data) => {
  return await API.post(`knowledge-check/`, data);
};

export const saveKnowledgeCheck = async (data) => {
  return await API.patch(`knowledge-check/`, data);
}

export const getProgress = async () => {
  return await API.get("progress/");
};