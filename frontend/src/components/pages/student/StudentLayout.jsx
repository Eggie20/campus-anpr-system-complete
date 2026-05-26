import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

// Student navigation menu items with Material icons
const studentMenuItems = [
  { path: '/dashboard', materialIcon: 'dashboard', label: 'Dashboard' },
  { path: '/vehicles', materialIcon: 'directions_car', label: 'My Vehicles' },
  { path: '/logs', materialIcon: 'history', label: 'Entry Logs' },
  { path: '/notifications', materialIcon: 'notifications', label: 'Notifications' },
  { path: '/profile', materialIcon: 'person', label: 'Profile' }
];

// Page titles for header
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'My Vehicles',
  '/logs': 'Entry Logs',
  '/notifications': 'Notifications',
  '/profile': 'Profile'
};

/**
 * StudentLayout - Sample design layout wrapper
 */
export default function StudentLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) {
        setIsMobileOpen(false); // Reset mobile state when going to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Determine effective collapsed state for Sidebar component
  const sidebarCollapsed = isMobile ? !isMobileOpen : isCollapsed;

  // Get current page title
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const dashboardTitle = user?.role === 'faculty' ? 'Faculty Portal' : 'Student Portal';

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        role={user?.role || 'student'}
        menuItems={studentMenuItems}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        title={dashboardTitle}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <Header
          user={{
            name: user?.full_name || 'User',
            email: user?.email,
            id: user?.student_id || user?.id,
          }}
          role={user?.role || 'student'}
          onMenuToggle={toggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
          pageTitle={pageTitle}
        />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
