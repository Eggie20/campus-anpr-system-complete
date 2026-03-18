import { Outlet } from 'react-router-dom';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';

// Faculty navigation menu items (same as student but with faculty branding)
const facultyMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/vehicles', icon: '🚗', label: 'My Vehicles' },
    { path: '/logs', icon: '📋', label: 'Entry Logs' },
    { path: '/notifications', icon: '🔔', label: 'Notifications', badge: 2 },
    { path: '/profile', icon: '👤', label: 'Profile' }
];

/**
 * FacultyLayout - Layout wrapper for all faculty pages
 * Uses the same structure as StudentLayout but with faculty-specific branding
 */
export default function FacultyLayout() {
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
    const sidebarCollapsed = isMobile ? !isMobileOpen : isCollapsed;

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <Sidebar
                role="faculty"
                menuItems={facultyMenuItems}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={isMobile}
            />

            {/* Main Content */}
            <main className="dashboard-main">
                <Header
                    user={user || { name: 'Maria Santos' }}
                    role="faculty"
                    onMenuToggle={toggleSidebar}
                    isSidebarCollapsed={sidebarCollapsed}
                    pageTitle="Faculty Portal"
                />

                <div className="dashboard-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
