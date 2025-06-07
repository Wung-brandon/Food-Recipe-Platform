import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
// Import icons
import RecommendIcon from '@mui/icons-material/Recommend';
import KitchenIcon from '@mui/icons-material/Kitchen';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  Dashboard as DashboardIcon,
  Bookmark as BookmarkIcon, 
  Restaurant as RestaurantIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  SmartToy as AiIcon,
  LocalDining as SmartCookingIcon,
  // Eco as SustainabilityIcon,
  Psychology as BrainIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

// Dashboard Layout with built-in navigation items and innovative features
interface ChefProfile {
  id: string | number;
}

interface User {
  username?: string;
  email?: string;
  chef_profile?: ChefProfile;
}

interface Notification {
  id: number;
  type: 'comment' | 'like' | 'follow' | 'ai_suggestion' | 'sustainability' | 'cooking_timer';
  message: string;
  time: string;
  read: boolean;
}

interface AIRecommendation {
  id: number;
  title: string;
  reason: string;
  confidence: number;
  image: string;
}

interface CookingSession {
  id: number;
  recipeName: string;
  currentStep: number;
  totalSteps: number;
  remainingTime: string;
  isActive: boolean;
}

interface SustainabilityMetric {
  carbonFootprint: number;
  localIngredients: number;
  seasonalScore: number;
  wasteReduction: number;
}

const UserDashboardLayout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Innovative Features State
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [activeCooking, setActiveCooking] = useState<CookingSession[]>([]);
  const [isCookingPanelOpen, setIsCookingPanelOpen] = useState(false);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<SustainabilityMetric>({
    carbonFootprint: 12.5,
    localIngredients: 78,
    seasonalScore: 85,
    wasteReduction: 34
  });
  const [isSustainabilityPanelOpen, setIsSustainabilityPanelOpen] = useState(false);

  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  
  // Initialize innovative features data
  useEffect(() => {
    // Enhanced notifications with AI and sustainability alerts
    const enhancedNotifications: Notification[] = [
      { id: 1, type: 'ai_suggestion', message: 'AI found 3 recipes perfect for your taste!', time: '2 min ago', read: false },
      { id: 2, type: 'cooking_timer', message: 'Pasta timer: 2 minutes remaining', time: '5 min ago', read: false },
      { id: 3, type: 'sustainability', message: 'Great job! 20% less carbon footprint this week', time: '1 hour ago', read: false },
      { id: 4, type: 'comment', message: 'New comment on your recipe', time: '2 hours ago', read: false },
      { id: 5, type: 'like', message: 'Someone liked your sustainable recipe', time: '3 hours ago', read: true }
    ];
    setNotifications(enhancedNotifications);

    // AI Recommendations
    const mockAiRecommendations: AIRecommendation[] = [
      {
        id: 1,
        title: 'Mediterranean Quinoa Bowl',
        reason: 'Based on your love for healthy, protein-rich meals',
        confidence: 94,
        image: '/api/placeholder/150/100'
      },
      {
        id: 2,
        title: 'Spicy Thai Curry',
        reason: 'You often cook Asian cuisine on weekends',
        confidence: 87,
        image: '/api/placeholder/150/100'
      },
      {
        id: 3,
        title: 'Seasonal Roasted Vegetables',
        reason: 'Perfect for your sustainability goals',
        confidence: 91,
        image: '/api/placeholder/150/100'
      }
    ];
    setAiRecommendations(mockAiRecommendations);

    // Active cooking sessions
    const mockCookingSessions: CookingSession[] = [
      {
        id: 1,
        recipeName: 'Homemade Pizza',
        currentStep: 3,
        totalSteps: 8,
        remainingTime: '25 min',
        isActive: true
      },
      {
        id: 2,
        recipeName: 'Chocolate Cookies',
        currentStep: 5,
        totalSteps: 6,
        remainingTime: '12 min',
        isActive: true
      }
    ];
    setActiveCooking(mockCookingSessions);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userId = user?.id;
  console.log('User ID:', userId);
  
  const navItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/dashboard/user' },
    { icon: <RestaurantIcon />, text: 'Recipes', path: '/dashboard/user/recipes' },
    { icon: <FavoriteIcon />, text: 'Favorites', path: '/dashboard/user/my-favorites' },
    {
      icon: <PersonIcon />,
      text: 'Profile',
      path: userId ? `/user-dashboard/user/profile/${userId}` : '/dashboard/user/profile'
    },
    { icon: <RecommendIcon />, text: 'Recommended for You', path: '/dashboard/user/recommendations' },
    { icon: <KitchenIcon />, text: 'Ingredient Search', path: '/dashboard/user/ingredient-search' },
    { icon: <CalendarMonthIcon />, text: 'Meal Planner', path: '/dashboard/user/meal-planner' },
    { icon: <SettingsIcon />, text: 'Settings', path: '/dashboard/user/settings' },
  ];
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const activeCookingCount = activeCooking.filter(c => c.isActive).length;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    closeOtherPanels('notifications');
  };
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    closeOtherPanels('profile');
  };

  const toggleAiPanel = () => {
    setIsAiPanelOpen(!isAiPanelOpen);
    closeOtherPanels('ai');
  };

  const toggleCookingPanel = () => {
    setIsCookingPanelOpen(!isCookingPanelOpen);
    closeOtherPanels('cooking');
  };

  const toggleSustainabilityPanel = () => {
    setIsSustainabilityPanelOpen(!isSustainabilityPanelOpen);
    closeOtherPanels('sustainability');
  };

  const closeOtherPanels = (except: string) => {
    if (except !== 'notifications') setIsNotificationsOpen(false);
    if (except !== 'profile') setIsProfileMenuOpen(false);
    if (except !== 'ai') setIsAiPanelOpen(false);
    if (except !== 'cooking') setIsCookingPanelOpen(false);
    if (except !== 'sustainability') setIsSustainabilityPanelOpen(false);
  };
  
  const closeAllMenus = () => {
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsAiPanelOpen(false);
    setIsCookingPanelOpen(false);
    setIsSustainabilityPanelOpen(false);
  };

  const isActiveRoute = (path) => {
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
            
            {/* Right side - Innovative Features + Notifications + User Menu */}
            <div className="flex items-center space-x-2">
              
              {/* AI Recommendations Button */}
              <div className="relative">
                <button
                  onClick={toggleAiPanel}
                  className="p-2 rounded-full text-white hover:bg-amber-700 focus:outline-none relative"
                  title="AI Recipe Suggestions"
                >
                  <AiIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {aiRecommendations.length}
                  </span>
                </button>
                
                {/* AI Panel Dropdown */}
                {isAiPanelOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 px-4 bg-purple-50 border-b border-purple-200 font-medium text-gray-800 flex items-center">
                      <BrainIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <span>AI Recipe Suggestions</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4">
                      {aiRecommendations.map(recommendation => (
                        <div key={recommendation.id} className="mb-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <img 
                              src={recommendation.image} 
                              alt={recommendation.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{recommendation.reason}</p>
                              <div className="flex items-center mt-2">
                                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                  {recommendation.confidence}% match
                                </div>
                                <button className="ml-2 text-sm text-amber-600 hover:text-amber-800">
                                  Try Recipe
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Cooking Assistant Button */}
              <div className="relative">
                <button
                  onClick={toggleCookingPanel}
                  className="p-2 rounded-full text-white hover:bg-amber-700 focus:outline-none relative"
                  title="Active Cooking Sessions"
                >
                  <SmartCookingIcon className="h-6 w-6" />
                  {activeCookingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeCookingCount}
                    </span>
                  )}
                </button>
                
                {/* Cooking Assistant Panel */}
                {isCookingPanelOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 px-4 bg-green-50 border-b border-green-200 font-medium text-gray-800 flex items-center">
                      <TimerIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span>Active Cooking Sessions</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-4">
                      {activeCooking.length > 0 ? (
                        activeCooking.map(session => (
                          <div key={session.id} className="mb-4 p-3 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{session.recipeName}</h4>
                              <span className="text-sm text-green-600 font-medium">{session.remainingTime}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(session.currentStep / session.totalSteps) * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {session.currentStep}/{session.totalSteps}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200">
                                Next Step
                              </button>
                              <button className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200">
                                Pause
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No active cooking sessions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sustainability Tracker Button */}
              <div className="relative">
                <button
                  onClick={toggleSustainabilityPanel}
                  className="p-2 rounded-full text-white hover:bg-amber-700 focus:outline-none"
                  title="Sustainability Metrics"
                >
                  <EmojiNatureIcon className="h-6 w-6" />
                </button>
                
                {/* Sustainability Panel */}
                {isSustainabilityPanelOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 px-4 bg-green-50 border-b border-green-200 font-medium text-gray-800 flex items-center">
                      <EmojiNatureIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span>Sustainability Dashboard</span>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Carbon Footprint</span>
                          <span className="text-sm font-medium text-green-600">{sustainabilityMetrics.carbonFootprint} kg CO₂</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Local Ingredients</span>
                          <span className="text-sm font-medium text-green-600">{sustainabilityMetrics.localIngredients}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Seasonal Score</span>
                          <span className="text-sm font-medium text-green-600">{sustainabilityMetrics.seasonalScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Waste Reduction</span>
                          <span className="text-sm font-medium text-green-600">{sustainabilityMetrics.wasteReduction}%</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">Great progress this week!</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          You've reduced your carbon footprint by 15% compared to last week
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Button */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-white hover:bg-amber-700 focus:outline-none"
                >
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-xs text-center leading-5">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Enhanced Notifications Dropdown */}
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
                                  {notification.type === 'ai_suggestion' ? (
                                    <div className="bg-purple-500 rounded-full p-2">
                                      <AiIcon className="h-4 w-4 text-white" />
                                    </div>
                                  ) : notification.type === 'cooking_timer' ? (
                                    <div className="bg-orange-500 rounded-full p-2">
                                      <TimerIcon className="h-4 w-4 text-white" />
                                    </div>
                                  ) : notification.type === 'sustainability' ? (
                                    <div className="bg-green-500 rounded-full p-2">
                                      <EmojiNatureIcon className="h-4 w-4 text-white" />
                                    </div>
                                  ) : notification.type === 'comment' ? (
                                    <div className="bg-blue-500 rounded-full p-2">
                                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="bg-red-500 rounded-full p-2">
                                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
              <div className="relative">
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
                        to={chefProfileId ? `/dashboard/chef/profile/${chefProfileId}` : '/dashboard/chef/profile'}
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

export default UserDashboardLayout;