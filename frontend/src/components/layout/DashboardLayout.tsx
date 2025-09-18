import React from 'react';
import { useSidebar } from '../../hooks/useSidebar';
import { getMenuItems } from '../../config/menuConfig';
import DesktopSidebar from './Sidebar/DesktopSidebar';
import MobileSidebar from './Sidebar/MobileSidebar';
import MobileMenuButton from './Sidebar/MobileMenuButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'admin' | 'partner';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole }) => {
  const {
    sidebarCollapsed,
    mobileMenuOpen,
    toggleSidebar,
    openMobileMenu,
    closeMobileMenu,
    handleMenuClick,
    handleLogout,
  } = useSidebar(userRole);

  const menuItems = getMenuItems(userRole);

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        userRole={userRole}
        menuItems={menuItems}
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
      />

      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={openMobileMenu} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        userRole={userRole}
        menuItems={menuItems}
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="transition-all duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 
