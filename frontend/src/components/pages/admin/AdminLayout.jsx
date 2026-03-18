import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import Header from '../../layouts/Header';
import Sidebar from '../../layouts/Sidebar';
import './Admin.css';

// Admin navigation menu items with categories
const adminMenuItems = [
  { type: 'header', label: 'MAIN PANEL' },
  { path: '/admin/dashboard', materialIcon: 'analytics', label: 'Dashboard' },
  { path: '/admin/users', materialIcon: 'group', label: 'Users' },
  { path: '/admin/vehicles', materialIcon: 'directions_car', label: 'Vehicles' },

  { type: 'header', label: 'MONITORING' },
  { path: '/admin/cameras', materialIcon: 'videocam', label: 'Cameras' },
  { path: '/admin/security-staff', materialIcon: 'security', label: 'Security Staff' },

  { type: 'header', label: 'SYSTEM' },
  { path: '/admin/analytics', materialIcon: 'trending_up', label: 'Analytics' },
  { path: '/admin/logs', materialIcon: 'assignment', label: 'System Logs' },
  { path: '/admin/settings', materialIcon: 'settings', label: 'Settings' }
];

/**
 * AdminLayout - Layout wrapper for all admin pages
 * Uses shared layout components (Header, Sidebar) for consistency
 */
export default function AdminLayout() {
  const { user } = useAuth();
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
  // On mobile: if mobile menu is OPEN, collapsed is FALSE. If CLOSED, collapsed is TRUE.
  const sidebarCollapsed = isMobile ? !isMobileOpen : isCollapsed;

  return (
    <div className="dashboard-container">
      {/* Shared Sidebar Component */}
      <Sidebar
        role="admin"
        menuItems={adminMenuItems}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        title="Campus ANPR"
      />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Shared Header Component */}
        <Header
          user={user}
          role="admin"
          onMenuToggle={toggleSidebar}
          pageTitle="Admin Dashboard"
        />

        {/* Page Content */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
