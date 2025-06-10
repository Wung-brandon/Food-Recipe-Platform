// components/RecipeLayoutWrapper.tsx
import React from 'react';
import { getUserInfo } from '../utils/recipeHelpers';

interface RecipeLayoutWrapperProps {
  children: React.ReactNode;
  UserDashboardLayout?: React.ComponentType<{ children: React.ReactNode }>;
  ChefDashboardLayout?: React.ComponentType<{ children: React.ReactNode }>;
  PublicLayout?: React.ComponentType<{ children: React.ReactNode }>;
}

const RecipeLayoutWrapper: React.FC<RecipeLayoutWrapperProps> = ({ 
  children, 
  UserDashboardLayout, 
  ChefDashboardLayout, 
}) => {
  const { isAuthenticated, userType } = getUserInfo();

  // If user is authenticated and we have dashboard layouts
  if (isAuthenticated && userType === 'chef' && ChefDashboardLayout) {
    return <ChefDashboardLayout>{children}</ChefDashboardLayout>;
  }
  
  if (isAuthenticated && userType === 'user' && UserDashboardLayout) {
    return <UserDashboardLayout>{children}</UserDashboardLayout>;
  }
  
  return <>{children}</>;
};

export default RecipeLayoutWrapper;