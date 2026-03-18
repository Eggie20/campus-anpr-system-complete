import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

// Visitor navigation menu items with Material icons
const visitorMenuItems = [
    { path: '/visitor/dashboard', materialIcon: 'dashboard', label: 'Dashboard' },
    { path: '/visitor/vehicles', materialIcon: 'directions_car', label: 'My Vehicles' },
    { path: '/visitor/logs', materialIcon: 'history', label: 'Entry Logs' },
    { path: '/visitor/notifications', materialIcon: 'notifications', label: 'Notifications' },
    { path: '/visitor/profile', materialIcon: 'person', label: 'Profile' }
];

// Page titles for header
const pageTitles = {
    '/visitor/dashboard': 'Dashboard',
    '/visitor/vehicles': 'My Vehicles',
    '/visitor/logs': 'Entry Logs',
    '/visitor/notifications': 'Notifications',
    '/visitor/profile': 'Profile'
};

/**
 * VisitorLayout - Sample design layout wrapper for Visitor
 */
export default function VisitorLayout() {
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
                role="visitor"
                menuItems={visitorMenuItems}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={isMobile}
                title="Visitor Portal"
            />

            {/* Main Content */}
            <main className="dashboard-main">
                <Header
                    user={{ name: user?.full_name || 'Visitor' }}
                    role="visitor"
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
