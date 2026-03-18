import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

/**
 * DashboardLayout - Main layout wrapper for all dashboard pages
 * Provides sidebar, header, content area, and footer
 * 
 * @param {Object} props
 * @param {string} props.role - User role for sidebar theming ('admin' | 'student' | 'faculty' | 'security')
 * @param {Array} props.menuItems - Navigation items for sidebar
 * @param {Object} props.user - Current user data
 */
export default function DashboardLayout({ role = 'student', menuItems = [], user = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`app-layout ${role}-dashboard`}>
      {/* Sidebar */}
      <Sidebar
        role={role}
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />

      {/* Main Content */}
      <main className="app-main">
        <Header
          user={user}
          role={role}
          onMenuToggle={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <div className="app-content">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  );
}
