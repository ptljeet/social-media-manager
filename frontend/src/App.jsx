// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import OrganizationPage from './pages/OrganizationPage';
import PostComposerPage from './pages/PostComposerPage';
import ReportsPage from './pages/ReportsPage';

import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import AdminPostApprovals from './pages/AdminPostApprovals';
import InviteUsers from './pages/InviteUsers';
import TeamManagementPage from './pages/TeamManagementPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// If you created the dedicated admin profile page:
import AdminProfilePage from './pages/AdminProfilePage';

import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- Public ---------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ---------- User (authenticated) ---------- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/post-composer"
          element={
            <PrivateRoute>
              <PostComposerPage />
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
          path="/reports"
          element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          }
        />

        {/* ---------- Admin (admin or super_admin) ---------- */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-users"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <ManageUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <AdminPostApprovals />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/invite-users"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <InviteUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <TeamManagementPage />
            </PrivateRoute>
          }
        />
        {/* Dedicated admin profile (separate from user profile) */}
        <Route
          path="/admin/profile"
          element={
            <PrivateRoute allowedRoles={['admin', 'super_admin']}>
              <AdminProfilePage />
            </PrivateRoute>
          }
        />

        {/* ---------- Super Admin only ---------- */}
        <Route
          path="/superadmin/dashboard"
          element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </PrivateRoute>
          }
        />

        {/* ---------- Optional placeholder routes (authenticated) ---------- */}
        {[
          '/inbox',
          '/publishing',
          '/listening',
          '/people',
          '/reviews',
        ].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <PrivateRoute>
                <div className="p-6 text-lg font-medium">
                  Coming Soon: {path.replace('/', '')}
                </div>
              </PrivateRoute>
            }
          />
        ))}

        {/* ---------- Fallback ---------- */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
