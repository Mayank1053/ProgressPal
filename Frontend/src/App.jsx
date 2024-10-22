// App.jsx
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./lib/navigation";

// Layout
import AppContainer from "./components/AppContainer";

// Pages
import HomePage from "./pages/Home"; // Updated to match new component name
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Additional pages (assuming these will be created based on bottom navigation)
import Lessons from "./pages/Lessons.jsx";
import Progress from "./pages/Progress";
import Tests from "./pages/Tests";
import { CoursesPage } from "./pages/Courses";
import { LessonContent } from "./components/lessonContent";
import { ReviewContentComponent } from "./components/reviewContent";

function App() {
  const navigate = useNavigate();
  setNavigate(navigate);

  return (
    <Routes>
      {/* Protected routes that require AppContainer */}
      <Route path="/" element={<AppContainer />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<Lessons />} />
        <Route
          path="courses/content/:subtopicTitle"
          element={<LessonContent />}
        />
        <Route
          path="courses/reviewContent"
          element={<ReviewContentComponent />}
        />
        <Route path="progress" element={<Progress />} />
        <Route path="tests" element={<Tests />} />
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email/verify/:code" element={<EmailVerification />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
