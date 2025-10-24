import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import Icon from './Icon';

const Sidebar: React.FC = () => {
  const { page, setPage, settings, setSettingsPage, authUser, logout } = useAppContext();

  let navItems: { id: Page; name: string; icon: string }[] = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: 'dashboard' },
    { id: 'requests', name: 'الطلبات', icon: 'requests' },
    { id: 'clients', name: 'العملاء', icon: 'clients' },
    { id: 'reports', name: 'التقارير', icon: 'report' },
    { id: 'settings', name: 'الإعدادات', icon: 'settings' },
  ];

  // Filter nav items based on user permissions
  if (authUser && !authUser.isGeneralManager) {
      navItems = navItems.filter(item => {
          if (item.id === 'settings') return authUser.permissions.canAccessSettings;
          if (item.id === 'reports') return authUser.permissions.canViewReports;
          if (item.id === 'requests') return authUser.permissions.canCreateRequests || authUser.permissions.canViewReports;
          if (item.id === 'clients') return authUser.permissions.canManageClients;
          return true;
      });
  }


  return (
    <div className="no-print w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b border-gray-700 flex items-center justify-center">
        <h1 className="text-xl font-bold">{settings.appName}</h1>
      </div>
      <nav className="flex-grow p-2">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.id === 'settings') {
                    setSettingsPage('general');
                  }
                  setPage(item.id);
                }}
                className={`flex items-center p-3 my-1 rounded-md transition-colors duration-200 ${
                  page === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon name={item.icon} className="w-5 h-5 me-3" />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        {authUser && (
          <div className="text-center p-3 bg-gray-800 rounded-lg flex items-center gap-3">
             {authUser.profilePictureUrl ? (
                <img src={authUser.profilePictureUrl} alt={authUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 flex-shrink-0">
                    <Icon name="employee" className="w-6 h-6 text-white" />
                </div>
            )}
            <div className="text-right">
                <p className="font-bold text-white whitespace-nowrap">{authUser.name}</p>
                <p className="text-sm text-gray-400">{authUser.isGeneralManager ? 'مدير عام' : 'موظف'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;