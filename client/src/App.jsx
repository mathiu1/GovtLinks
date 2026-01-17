import React, { useState, useEffect, Suspense, lazy } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import Loading from "./components/Loading";
import BannerPopup from "./components/BannerPopup";
import API from "./api";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Detail = lazy(() => import("./pages/Detail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Quiz = lazy(() => import("./pages/Quiz"));
const AIChat = lazy(() => import("./pages/AIChat"));
const Activities = lazy(() => import("./pages/Activities"));
const GameQuiz = lazy(() => import("./pages/GameQuiz"));
const QuestMap = lazy(() => import("./pages/QuestMap"));
const ChronologyGame = lazy(() => import("./pages/ChronologyGame"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageItems = lazy(() => import("./pages/admin/ManageItems"));
const UsersList = lazy(() => import("./pages/admin/UsersList"));
const ManageBanners = lazy(() => import("./pages/admin/ManageBanners"));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const token = localStorage.getItem("token");
        const type = token ? "member" : "guest";

        if (!sessionStorage.getItem("visited")) {
          sessionStorage.setItem("visited", "true");
          await API.post("/track-visit", { type });
        }
      } catch (e) {
        console.error("Tracking failed", e);
      }
    };
    trackVisit();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleTopicClick = (id) => {
    setSelectedTopic(id);

    // If we're not on home, navigate back so we can see the results
    if (location.pathname !== "/") {
      navigate("/", { state: { fromSidebar: true } });
      // Scroll to top or list after navigation (delay for mount)
      setTimeout(() => {
        const element = document.getElementById("content-list");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById("content-list");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    if (window.innerWidth <= 1024) closeSidebar();
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <div className="min-h-screen text-slate-800 dark:text-slate-100 relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-400/10 dark:bg-blue-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob"></div>
              <div className="absolute top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-400/10 dark:bg-indigo-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-slate-400/10 dark:bg-slate-800/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
              <ScrollToTop />
              {!["/chronology", "/quest", "/game"].includes(
                location.pathname,
              ) && <Navbar toggleSidebar={toggleSidebar} />}

              {/* Shared Sidebar - Hidden in Games */}
              {!["/chronology", "/quest", "/game"].includes(
                location.pathname,
              ) && (
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  closeSidebar={closeSidebar}
                  selectedTopic={selectedTopic}
                  handleTopicClick={handleTopicClick}
                  navigate={navigate}
                />
              )}

              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <Home
                        isSidebarOpen={isSidebarOpen}
                        closeSidebar={closeSidebar}
                        selectedTopic={selectedTopic}
                        setSelectedTopic={setSelectedTopic}
                        handleTopicClick={handleTopicClick}
                      />
                    }
                  />
                  <Route path="/detail/:id" element={<Detail />} />
                  <Route
                    path="/quiz"
                    element={
                      <Quiz
                        isSidebarOpen={isSidebarOpen}
                        closeSidebar={closeSidebar}
                        handleTopicClick={handleTopicClick}
                      />
                    }
                  />
                  <Route path="/ai" element={<AIChat />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/game" element={<GameQuiz />} />
                  <Route path="/quest" element={<QuestMap />} />
                  <Route
                    path="/chronology"
                    element={<ChronologyGame isSidebarOpen={isSidebarOpen} />}
                  />

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route
                        path="services"
                        element={<ManageItems pageCategory="Service" />}
                      />
                      <Route
                        path="schemes"
                        element={<ManageItems pageCategory="Scheme" />}
                      />
                      <Route
                        path="jobs"
                        element={<ManageItems pageCategory="Job" />}
                      />
                      <Route
                        path="exams"
                        element={<ManageItems pageCategory="Exam" />}
                      />
                      <Route path="users" element={<UsersList />} />
                      <Route path="banners" element={<ManageBanners />} />
                    </Route>
                  </Route>

                  {/* 404 Route - Must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>

            {/*<BannerPopup />*/}
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
