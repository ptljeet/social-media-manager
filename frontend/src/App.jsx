import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage'; // make sure this file exists
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/home"
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
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
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
