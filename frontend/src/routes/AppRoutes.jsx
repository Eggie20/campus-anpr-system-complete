import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Page Components - Public
import Login from '../components/pages/public/Login/Login';
import Register from '../components/pages/public/Register/Register';
import AdminLogin from '../components/pages/public/AdminLogin/AdminLogin';
import SecurityLogin from '../components/pages/public/SecurityLogin/SecurityLogin';
import ForgotPassword from '../components/pages/public/ForgotPassword/ForgotPassword';

// Layout Components
import AdminLayout from '../components/pages/admin/AdminLayout';
import StudentLayout from '../components/pages/student/StudentLayout';

// Admin Pages
import AdminDashboard from '../components/pages/admin/Dashboard/Dashboard';
import Users from '../components/pages/admin/Users/Users';
import Vehicles from '../components/pages/admin/Vehicles/Vehicles';
import Cameras from '../components/pages/admin/Cameras/Cameras';
import SecurityStaff from '../components/pages/admin/SecurityStaff/SecurityStaff';
import Analytics from '../components/pages/admin/Analytics/Analytics';
import Logs from '../components/pages/admin/Logs/Logs';
import Settings from '../components/pages/admin/Settings/Settings';

// Student/Faculty Pages
import StudentDashboard from '../components/pages/student/Dashboard/Dashboard';
import MyVehicles from '../components/pages/student/MyVehicles/MyVehicles';
import EntryLogs from '../components/pages/student/EntryLogs/EntryLogs';
import Notifications from '../components/pages/student/Notifications/Notifications';
import Profile from '../components/pages/student/Profile/Profile';

// Security Pages
import SecurityDashboard from '../components/pages/security/Dashboard/SecurityDashboard';

// Staff Pages
import StaffLayout from '../components/pages/staff/StaffLayout';
import StaffDashboard from '../components/pages/staff/Dashboard/Dashboard';

// Visitor Pages
import VisitorLayout from '../components/pages/visitor/VisitorLayout';
import VisitorDashboard from '../components/pages/visitor/Dashboard/Dashboard';

// Staff Specific Pages
import StaffVehicles from '../components/pages/staff/MyVehicles/MyVehicles';
import StaffLogs from '../components/pages/staff/EntryLogs/EntryLogs';
import StaffNotifications from '../components/pages/staff/Notifications/Notifications';
import StaffProfile from '../components/pages/staff/Profile/Profile';

// Visitor Specific Pages
import VisitorVehicles from '../components/pages/visitor/MyVehicles/MyVehicles';
import VisitorLogs from '../components/pages/visitor/EntryLogs/EntryLogs';
import VisitorNotifications from '../components/pages/visitor/Notifications/Notifications';
import VisitorProfile from '../components/pages/visitor/Profile/Profile';

// Placeholder components
const NotFoundPage = () => <div>404 - Page Not Found</div>;
const UnauthorizedPage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</h1>
    <h2>Access Denied</h2>
    <p style={{ marginBottom: '1.5rem', color: '#666' }}>
      You don't have permission to access this page.
    </p>
    <a href="/login" style={{
      color: '#4f46e5',
      textDecoration: 'underline'
    }}>
      Return to Login
    </a>
  </div>
);

// Protected Route Component
function PrivateRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

// Public Route Component (redirects authenticated users)
function PublicRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) {
    switch (user?.role) {
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'security': return <Navigate to="/security/dashboard" replace />;
      case 'staff': return <Navigate to="/staff/dashboard" replace />;
      case 'visitor': return <Navigate to="/visitor/dashboard" replace />;
      default: return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/admin-login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
      <Route path="/security-login" element={<PublicRoute><SecurityLogin /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes - Nested under AdminLayout */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="cameras" element={<Cameras />} />
        <Route path="security-staff" element={<SecurityStaff />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Student Routes - Nested under StudentLayout */}
      <Route
        path="/"
        element={
          <PrivateRoute allowedRoles={['student', 'faculty']}>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="vehicles" element={<MyVehicles />} />
        <Route path="logs" element={<EntryLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <PrivateRoute allowedRoles={['staff']}>
            <StaffLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="vehicles" element={<StaffVehicles />} />
        <Route path="logs" element={<StaffLogs />} />
        <Route path="notifications" element={<StaffNotifications />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>

      {/* Visitor Routes */}
      <Route
        path="/visitor"
        element={
          <PrivateRoute allowedRoles={['visitor']}>
            <VisitorLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VisitorDashboard />} />
        <Route path="vehicles" element={<VisitorVehicles />} />
        <Route path="logs" element={<VisitorLogs />} />
        <Route path="notifications" element={<VisitorNotifications />} />
        <Route path="profile" element={<VisitorProfile />} />
      </Route>

      {/* Security Routes */}
      <Route
        path="/security/dashboard"
        element={
          <PrivateRoute allowedRoles={['security']}>
            <SecurityDashboard />
          </PrivateRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
