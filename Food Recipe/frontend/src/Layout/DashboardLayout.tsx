import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useThemeBackground } from '../context/BackgroundContext';
import { 
  Dashboard as DashboardIcon, 
  Person as ProfileIcon, 
  Settings as SettingsIcon, 
  Message as MessageIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { 
  FaUtensils, 
  FaHeart, 
  FaChartPie,
  FaClipboardList,
  FaShoppingCart
} from "react-icons/fa";
import { 
  MdDarkMode,
  MdLightMode
} from 'react-icons/md';
import { Switch, Avatar, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Sidebar Navigation Items
const sidebarNavItems = [
  { 
    icon: <DashboardIcon />, 
    label: 'Dashboard', 
    link: '/dashboard' 
  },
  { 
    icon: <FaUtensils />, 
    label: 'My Recipes', 
    link: '/dashboard/recipes' 
  },
  { 
    icon: <FaHeart />, 
    label: 'My Favorites', 
    link: '/dashboard/favorites' 
  },
  { 
    icon: <ProfileIcon />, 
    label: 'Profile', 
    link: '/dashboard/profile' 
  },
  { 
    icon: <MessageIcon />, 
    label: 'Messages', 
    link: '/dashboard/messages' 
  },
  { 
    icon: <SettingsIcon />, 
    label: 'Settings', 
    link: '/dashboard/settings' 
  },
  { 
    icon: <FaChartPie />, 
    label: 'Analytics', 
    link: '/dashboard/analytics' 
  },
  { 
    icon: <FaClipboardList />, 
    label: 'Meal Planner', 
    link: '/dashboard/meal-planner' 
  },
  { 
    icon: <FaShoppingCart />, 
    label: 'Order History', 
    link: '/dashboard/orders' 
  }
];

// Sidebar Component
const Sidebar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeBackground();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const { logout, getUserProfile, user } = useAuth();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setUserProfile(profileData);
        console.log("profile data", profileData)
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [getUserProfile]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Generate avatar fallback from email
  const getAvatarFallback = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // Default fallback
  };

  // Handle logout with proper function call
  const handleLogout = () => {
    logout();
  };

  // Navigate to profile page
  const goToProfile = () => {
    navigate('/dashboard/profile');
  };

  // Reusable menu item rendering
  const renderMenuItem = (
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void, 
    isActive: boolean = false, 
    isSpecial: boolean = false
  ) => {
    return (
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center p-[0.4rem] cursor-pointer rounded-lg
          ${isSpecial 
            ? (isDarkMode 
              ? 'text-red-300 hover:bg-red-900/20 hover:text-red-200' 
              : 'text-red-600 hover:bg-red-50')
            : (isActive 
              ? (isDarkMode 
                ? 'bg-amber-900/30 text-amber-300' 
                : 'bg-amber-100 text-amber-600')
              : (isDarkMode 
                ? 'hover:bg-dark-bg-primary hover:text-dark-text-secondary' 
                : 'hover:bg-amber-50 hover:text-amber-700'))}
          transition-colors duration-300
        `}
        onClick={onClick}
      >
        <span className="mr-3 w-6 flex items-center justify-center">{icon}</span>
        {isExpanded && <span className="truncate">{label}</span>}
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ width: '4rem' }}
      animate={{ 
        width: isExpanded ? '16rem' : '4rem',
        transition: { duration: 0.3 }
      }}
      className={`
        h-screen fixed left-0 top-0 z-50 overflow-hidden
        ${isDarkMode 
          ? 'bg-dark-bg-secondary text-dark-text-primary border-r border-gray-700' 
          : 'bg-light-bg-primary text-light-text-primary border-r'}
        transition-all duration-300 shadow-lg
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className={`
          absolute top-4 right-4 z-10 
          ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-secondary'}
        `}
      >
        {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>

      <div className="p-4 pt-16 h-full flex flex-col">
        {/* User Profile - Clickable */}
        <div 
          className="mb-8 flex items-center cursor-pointer" 
          onClick={goToProfile}
        >
          <Avatar 
            src={userProfile?.avatar || undefined} 
            alt={userProfile?.full_name || user?.username || "User"} 
            className="mr-4 w-12 h-12"
          >
            {!userProfile?.avatar && getAvatarFallback()}
          </Avatar>
          {isExpanded && (
            <div>
              <Typography variant="subtitle1" className="font-bold">
                {userProfile?.full_name || user?.username || "User"}
              </Typography>
              <Typography variant="body2" className={`
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
              `}>
                {user?.email || "No email"}
              </Typography>
            </div>
          )}
        </div>

        {/* Navigation Container with Max Height */}
        <div className="flex-grow">
          <nav className="space-y-1">
            {sidebarNavItems.map((item) => (
              renderMenuItem(
                item.icon, 
                item.label, 
                () => navigate(item.link), 
                location.pathname === item.link
              )
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className={`
          my-4 border-t 
          ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}></div>

        {/* Theme Toggle */}
        {renderMenuItem(
          isDarkMode ? <MdDarkMode /> : <MdLightMode />, 
          isDarkMode ? 'Dark Mode' : 'Light Mode', 
          toggleTheme
        )}

        {/* Logout - Fixed the function call */}
        {renderMenuItem(
          <LogoutIcon />, 
          'Logout', 
          handleLogout, 
          false, 
          true
        )}

        {/* Theme Switch (only visible when expanded) */}
        {isExpanded && (
          <div className="flex items-center justify-end mb-4">
            <Switch 
              checked={isDarkMode}
              onChange={toggleTheme}
              color="primary"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Dashboard Layout
const DashboardLayout: React.FC = () => {
  const { isDarkMode } = useThemeBackground();

  return (
    <div className={`
      flex min-h-screen 
      ${isDarkMode 
        ? 'bg-[#121212] text-white' 
        : 'bg-light-bg-primary text-light-text-primary'}
      transition-colors duration-300
    `}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className={`
        ml-16 flex-1 p-6 
        ${isDarkMode 
          ? 'bg-[#121212] text-white' 
          : 'bg-light-bg-primary text-light-text-primary'}
      `}>
        <Outlet />
      </main>
    </div>
  );
};

// Wrapped Dashboard Layout with Theme Provider
const DashboardLayoutWrapper: React.FC = () => (
  <ThemeProvider>
    <DashboardLayout />
  </ThemeProvider>
);

export default DashboardLayoutWrapper;