import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import icons
import {
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Drafts as DraftsIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Dashboard Layout with built-in navigation items
const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { id } = useParams()
  
  // Define notification interface
  interface Notification {
    id: number;
    type: 'comment' | 'like' | 'follow';
    message: string;
    time: string;
    read: boolean;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Built-in navigation items for chef dashboard
  const navItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/dashboard/chef' },
    { icon: <MenuBookIcon />, text: 'My Recipes', path: '/dashboard/chef/recipe' },
    { icon: <AddCircleIcon />, text: 'Create Recipe', path: '/dashboard/chef/create-recipe' },
    { icon: <PeopleIcon />, text: 'Followers', path: '/dashboard/chef/followers' },
    // { icon: <DraftsIcon />, text: 'Drafts', path: '/dashboard/chef/drafts' },
    { icon: <AnalyticsIcon />, text: 'Analytics', path: '/dashboard/chef/analytics' },
    { icon: <PersonIcon />, text: 'Profile', path: `/dashboard/chef/profile/${id}` },
    { icon: <SettingsIcon />, text: 'Settings', path: '/dashboard/chef/settings' },
  ];
  
  // Fetch notifications on mount
  useEffect(() => {
    // Simulated notifications fetch
    const demoNotifications: Notification[] = [
      { id: 1, type: 'comment', message: 'New comment on your recipe', time: '5 min ago', read: false },
      { id: 2, type: 'like', message: 'Someone liked your recipe', time: '2 hours ago', read: false },
      { id: 3, type: 'follow', message: 'New follower', time: '1 day ago', read: true }
    ];
    setNotifications(demoNotifications);
  }, []);
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };
  
  const closeAllMenus = () => {
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Function to check if a nav item is active - improved to be more specific
  const isActiveRoute = (path) => {
    // Use exact matching instead of includes
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-amber-600 text-white shadow-md">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo + Mobile Menu Toggle */}
            <div className="flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-amber-700 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0 font-bold text-xl">
                {title}
              </div>
            </div>
            
            {/* Right side - Notifications + User Menu */}
            <div className="flex items-center">
              {/* Notifications Button */}
              <div className="relative ml-3">
                <button
                  onClick={toggleNotifications}
                  className="p-1 rounded-full text-white hover:bg-amber-700 focus:outline-none"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-center">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-800 flex justify-between items-center">
                      <span>Notifications</span>
                      <button className="text-sm text-amber-600 hover:text-amber-800">
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-100 ${!notification.read ? 'bg-amber-50' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mt-0.5">
                                  {notification.type === 'comment' ? (
                                    <div className="bg-blue-500 rounded-full p-2">
                                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                      </svg>
                                    </div>
                                  ) : notification.type === 'like' ? (
                                    <div className="bg-red-500 rounded-full p-2">
                                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="bg-green-500 rounded-full p-2">
                                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          No notifications yet
                        </div>
                      )}
                    </div>
                    <div className="py-1 border-t border-gray-100">
                      <Link to="/notifications" className="block px-4 py-2 text-sm text-center text-amber-600 hover:text-amber-900" onClick={closeAllMenus}>
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative ml-3">
                <button
                  onClick={toggleProfileMenu}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-600 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-semibold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
                
                {/* Profile Menu Dropdown */}
                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                      </div>
                      <Link
                        to="/dashboard/chef/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeAllMenus}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/dashboard/chef/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeAllMenus}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:sticky top-0 lg:top-16 z-40 lg:z-0 h-screen lg:h-[calc(100vh-4rem)] w-64 
          bg-white border-r border-gray-200 pt-5 pb-4 transition-transform duration-300 ease-in-out
        `}>
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-4 mb-5">
            <Link to="/" className="text-amber-600 font-bold text-xl">
              PerfectRecipe
            </Link>
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="mt-5 flex-grow flex flex-col px-2">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.path);
                return (
                  <Link
                    key={item.text}
                    to={item.path}
                    className={`
                      group flex items-center px-2 py-3 text-sm font-medium rounded-lg
                      ${isActive 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-amber-500' : 'text-gray-500 group-hover:text-gray-600'}
                    `}>
                      {item.icon}
                    </div>
                    {item.text}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Info Footer */}
          <div className="px-3 mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-amber-600 hover:text-amber-800"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={toggleMobileMenu}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;