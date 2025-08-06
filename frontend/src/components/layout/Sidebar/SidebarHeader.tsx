import React from 'react';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ collapsed, onToggle }) => {
  return (
    <div className={`p-4 border-b border-gray-700 ${collapsed ? 'px-2' : 'px-4'}`}>
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-400 flex-shrink-0" />
            <span className="text-xl font-bold text-white">Quantum</span>
            {/* <img src="/with_bg.PNG" className="w-48 h-48" alt="Quantum Logo" /> */}
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <Shield className="h-8 w-8 text-green-400" />

          </div>
        )}
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ${collapsed ? 'ml-0' : 'ml-2'
            }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader; 