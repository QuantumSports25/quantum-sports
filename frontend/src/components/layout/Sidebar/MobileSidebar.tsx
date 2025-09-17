import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, X, LogOut } from 'lucide-react';
import { MenuItem } from '../../../config/menuConfig';
import { isActiveRoute, getUserDisplayName, getUserInitial } from '../../../utils/dashboardUtils';

interface MobileSidebarProps {
  userRole: 'admin' | 'partner';
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (path: string) => void;
  onLogout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  userRole,
  menuItems,
  isOpen,
  onClose,
  onMenuClick,
  onLogout,
}) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative flex flex-col w-80 max-w-xs bg-gray-800 border-r border-gray-700 shadow-xl">
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">Quantum</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {getUserInitial(userRole)}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">
                {getUserDisplayName(userRole)}
              </p>
              <p className="text-gray-400 text-sm capitalize">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(location.pathname, item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuClick(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Back-to-HomePage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar; 