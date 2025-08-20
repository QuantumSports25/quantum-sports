import React from 'react';
// import { Save } from 'lucide-react';
import AccountSettings from '../../../components/common/AccountSettings';

const PlatformSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <AccountSettings variant="dark" />
      {/* <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Platform Settings</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Quantum Sports"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@quantum.com"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform Description
            </label>
            <textarea
              rows={4}
              defaultValue="Quantum is a comprehensive sports venue booking platform that connects users with premium sports facilities."
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                defaultValue="15"
                min="0"
                max="100"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Partner Subscription Fee (₹/month)
              </label>
              <input
                type="number"
                defaultValue="5000"
                min="0"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Reset to Default
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PlatformSettings; 