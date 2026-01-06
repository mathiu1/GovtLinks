import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageItems from './pages/admin/ManageItems';
import BannerPopup from './components/BannerPopup';
import API from './api';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const token = localStorage.getItem('token');
        const type = token ? 'member' : 'guest';

        if (!sessionStorage.getItem('visited')) {
          // Set flag immediately to prevent race conditions
          sessionStorage.setItem('visited', 'true');
          await API.post('/track-visit', { type });
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

  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <div className="min-h-screen text-slate-800 dark:text-slate-100 relative overflow-hidden bg-slate-50 dark:bg-[#0B1120] transition-colors duration-500">
            {/* Professional Mesh Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              {/* Subtler, more expansive gradients */}
              <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-400/10 dark:bg-blue-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob"></div>
              <div className="absolute top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-400/10 dark:bg-indigo-900/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full bg-slate-400/10 dark:bg-slate-800/10 blur-[120px] mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <>
                    <Navbar toggleSidebar={toggleSidebar} />
                    <Home isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
                  </>
                } />
                <Route path="/detail/:id" element={
                  <>
                    <Navbar toggleSidebar={toggleSidebar} />
                    <Detail />
                  </>
                } />

                {/* Auth Routes */}
                <Route path="/login" element={<><Navbar toggleSidebar={() => { }} /><Login /></>} />
                <Route path="/register" element={<><Navbar toggleSidebar={() => { }} /><Register /></>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="items" element={<ManageItems />} />
                  </Route>
                </Route>
              </Routes>
            </div>

            {/* Global Ads (Video/Popup) - Conditionally rendered inside component */}
            <BannerPopup />
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
