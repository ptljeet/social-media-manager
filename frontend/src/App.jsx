import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import OrganizationPage from './pages/OrganizationPage';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import TeamManagementPage from './pages/TeamManagementPage';
import ReportsPage from './pages/ReportsPage';
import PostComposerPage from './pages/PostComposerPage';
import AdminPostApprovals from './pages/AdminPostApprovals';


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route path="/reports" element={<ReportsPage />} />

        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/organizations"
          element={
            <PrivateRoute>
              <OrganizationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/post-composer" element={<PostComposerPage />} />
        <Route path="/admin/approvals" element={<AdminPostApprovals />} />

        <Route
          path="/admin/teams"
          element={
            <PrivateRoute>
              <TeamManagementPage />
            </PrivateRoute>
          }
        />

        {/* Optional Placeholder Routes */}
        {[
          "/inbox",
          "/publishing",
          "/listening",
          "/reports",
          "/people",
          "/reviews"
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <PrivateRoute>
                <div className="p-6 text-lg font-medium">
                  Coming Soon: {path.replace("/", "")}
                </div>
              </PrivateRoute>
            }
          />
        ))}
      </Routes>
    </Router>
  );
}
