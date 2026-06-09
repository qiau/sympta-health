import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import UploadDatasetPage from "./pages/admin/UploadDatasetPage";
import ManageDatasetPage from "./pages/admin/ManageDatasetPage";
import UserDashboardPage from "./pages/user/DashboardPage";
import InputSymptomPage from "./pages/user/InputSymptomPage";
import HistoryPage from "./pages/user/HistoryPage";
import HistoryDetailPage from "./pages/user/HistoryDetailPage";
import PublicRoute from "./components/routes/PublicRoute";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/home" replace />;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="p-4">Memuat sesi kamu...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/upload-dataset"
              element={<UploadDatasetPage />}
            />
            <Route
              path="/admin/manage-dataset"
              element={<ManageDatasetPage />}
            />

            <Route path="/home" element={<UserDashboardPage />} />
            <Route path="/input-symptom" element={<InputSymptomPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/history/:historyId" element={<HistoryDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
