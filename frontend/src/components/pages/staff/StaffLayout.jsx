import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

// Staff navigation menu items with Material icons
const staffMenuItems = [
    { path: '/staff/dashboard', materialIcon: 'dashboard', label: 'Dashboard' },
    { path: '/staff/vehicles', materialIcon: 'directions_car', label: 'My Vehicles' },
    { path: '/staff/logs', materialIcon: 'history', label: 'Entry Logs' },
    { path: '/staff/notifications', materialIcon: 'notifications', label: 'Notifications' },
    { path: '/staff/profile', materialIcon: 'person', label: 'Profile' }
];

// Page titles for header
const pageTitles = {
    '/staff/dashboard': 'Dashboard',
    '/staff/vehicles': 'My Vehicles',
    '/staff/logs': 'Entry Logs',
    '/staff/notifications': 'Notifications',
    '/staff/profile': 'Profile'
};

/**
 * StaffLayout - Sample design layout wrapper for Staff
 */
export default function StaffLayout() {
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

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar
                role="staff"
                menuItems={staffMenuItems}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={isMobile}
                title="Staff Portal"
            />

            {/* Main Content */}
            <main className="dashboard-main">
                <Header
                    user={{
                        name: user?.full_name || 'Staff Member',
                        email: user?.email,
                        id: user?.staff_id || user?.id
                    }}
                    role="staff"
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
