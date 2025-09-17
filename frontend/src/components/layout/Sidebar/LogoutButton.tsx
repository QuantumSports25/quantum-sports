import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  collapsed: boolean;
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ collapsed, onLogout }) => {
  return (
    <div className={`p-4 border-t border-gray-700 ${collapsed ? 'px-2' : 'px-4'}`}>
      <div className="relative group">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-3' : 'space-x-3 px-3'} py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Back-to-HomePage</span>}
        </button>
        
        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-gray-700">
            Back-to-HomePage
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutButton; 