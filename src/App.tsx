import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Existing pages (your current pages — keep them as-is)
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// ... etc

// Manager imports — NEW
import { ManagerLayout } from "./components/ManagerLayout";
import { ManagerRoute } from "./components/ManagerRoute";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerUsers from "./pages/manager/ManagerUsers";
import ManagerSettings from "./pages/manager/ManagerSettings";

// Auth redirect helper — checks role after login
export function AuthRedirect() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (user.role === "MANAGER")
    return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Existing routes (keep yours here unchanged) ─── */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        {/* <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
        {/* ... */}

        {/* ─── Root redirect by role ─── */}
        <Route path="/" element={<AuthRedirect />} />

        {/* ─── Manager routes (role-protected) ─── */}
        <Route
          path="/manager"
          element={
            <ManagerRoute>
              <ManagerLayout>
                {/* Outlet not used — children passed directly */}
                <Navigate to="/manager/dashboard" replace />
              </ManagerLayout>
            </ManagerRoute>
          }
        />

        <Route
          path="/manager/dashboard"
          element={
            <ManagerRoute>
              <ManagerLayout>
                <ManagerDashboard />
              </ManagerLayout>
            </ManagerRoute>
          }
        />

        <Route
          path="/manager/users"
          element={
            <ManagerRoute>
              <ManagerLayout>
                <ManagerUsers />
              </ManagerLayout>
            </ManagerRoute>
          }
        />

        <Route
          path="/manager/settings"
          element={
            <ManagerRoute>
              <ManagerLayout>
                <ManagerSettings />
              </ManagerLayout>
            </ManagerRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
