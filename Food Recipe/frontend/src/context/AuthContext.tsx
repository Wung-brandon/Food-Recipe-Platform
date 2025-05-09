/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Interfaces for TypeScript
interface User {
  id: string;
  email: string;
  username?: string;
  role?: 'user' | 'chef' | 'admin'; // Add role field
}

interface UserProfile {
  full_name: string;
  bio?: string;
  email: string;
  username: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  profile_picture?: string;
}

interface ChefProfile extends UserProfile {
  specialty?: string;
  experience?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (email: string, password: string, confirm_password: string, username: string) => Promise<void>;
  registerChef: (email: string, password: string, confirm_password: string, username: string, specialty: string, experience: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  getUserProfile: (id: number) => Promise<UserProfile>;
  getChefProfile: (id: number) => Promise<ChefProfile>;
  checkChefStatus: () => Promise<string>;
  isAuthenticated: boolean;
  userRole: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const BaseUrl = "http://127.0.0.1:8000/"
  const navigate = useNavigate()

  // Check for existing token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
  
    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<User & { role?: string }>(storedToken);
        console.log("Decoded token:", decoded);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role || 'user'); // Set role from storage or default to 'user'
      } catch {
        // Invalid token, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/token/`, 
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const { access, refresh, user: userData } = response.data;
  
      // Store tokens and user in local storage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
  
      // Set user and authentication state
      setUser(userData);
      setToken(access);
      setIsAuthenticated(true);
      setUserRole(userData.role || 'user');
  
      // Navigate based on user role
      if (userData.role === 'admin') {
        navigate("/admin-dashboard");
      } else if (userData.role === 'chef') {
        navigate("/chef-dashboard");
      } else {
        navigate("/user-dashboard");
      }
      
      toast.success("Login Successful");
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error("Invalid credentials");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  // Google Login
  const googleLogin = async (googleToken: string) => {
    try {
      const response = await axios.post('/api/auth/google-login/', { token: googleToken });
      const { access, refresh, user: userData } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set user and authentication state
      setUser(userData);
      setToken(access);
      setIsAuthenticated(true);
      setUserRole(userData.role || 'user');

      // Navigate based on user role
      if (userData.role === 'admin') {
        navigate("/admin-dashboard");
      } else if (userData.role === 'chef') {
        navigate("/chef-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch {
      throw new Error('Google login failed');
    }
  };

  // Regular user register function
  const register = async (email: string, password: string, confirm_password: string, username: string) => {
    console.log("Sending registration data:", { username, email, password, confirm_password });

    try {
        const response = await axios.post(`${BaseUrl}api/auth/signup/`, { 
            username,
            email,
            password,
            confirm_password 
        });

        console.log("Response received:", response.data);
        toast.success("Registration Successful! Please verify your email to continue.");
        navigate("/login");
    } catch (error: any) {
        handleRegistrationError(error);
        throw new Error('Registration failed');
    }
  };

  // Chef register function
  const registerChef = async (
    email: string, 
    password: string, 
    confirm_password: string, 
    username: string,
    specialtization: string,
    years_of_experience: number,
    certification_number: string,
    issuing_authority: string,
    has_accepted_terms: boolean 
  ) => {
    try {
        const response = await axios.post(`${BaseUrl}api/auth/chef/signup/`, { 
            username,
            email,
            password,
            confirm_password,
            specialtization,
            years_of_experience,
            certification_number,
            issuing_authority,
            has_accepted_terms

        });

        console.log("Response received:", response.data);
        toast.success("Chef Registration Successful! Your application is pending approval.");
        navigate("/login");
    } catch (error: any) {
        handleRegistrationError(error);
        throw new Error('Chef registration failed');
    }
  };

  // Helper function to handle registration errors
  const handleRegistrationError = (error: any) => {
    console.error("Registration error:", error.response?.data);
    
    // Handle different types of error messages
    if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for email errors
        if (errorData.email) {
            toast.error(`Email: ${errorData.email[0]}`);
        }
        // Check for username errors
        else if (errorData.username) {
            toast.error(`Username: ${errorData.username[0]}`);
        }
        // Check for password errors
        else if (errorData.password) {
            toast.error(`Password: ${errorData.password[0]}`);
        }
        // Check for confirm_password errors
        else if (errorData.confirm_password) {
            toast.error(`${errorData.confirm_password[0]}`);
        }
        // Handle non-field errors
        else if (errorData.non_field_errors) {
            toast.error(errorData.non_field_errors[0]);
        }
        // Handle unknown errors
        else {
            toast.error("Registration failed. Please try again.");
        }
    } else {
        toast.error("Registration failed. Please check your connection.");
    }
  };

  // Logout function
  const logout = () => {
    // Clear tokens and user from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  
    // Reset state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    navigate("/login");
    toast.success("Logout Successful");
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`${BaseUrl}api/auth/forgot-password/`, { email });
      toast.success('Reset Password link has been sent to your email');
    } catch {
      toast.error('Failed to send password reset link');
      throw new Error('Failed to send password reset link');
    }
  };

  // Reset Password
  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
      await axios.post(`${BaseUrl}api/auth/reset-password/`, { 
        email, 
        token, 
        new_password: newPassword 
      });
      toast.success('Password reset successful! You can now log in with your new password.');
      navigate('/login');
    } catch {
      toast.error('Failed to reset password.');
      throw new Error('Failed to reset password');
    }
  };

  // Get User Profile
  const getUserProfile = async (id: number): Promise<UserProfile> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/user/profile/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch user profile');
    }
  };

  // Get Chef Profile
  const getChefProfile = async (id: number): Promise<ChefProfile> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/chef/profile/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch chef profile');
    }
  };

  // Check Chef Status
  const checkChefStatus = async (): Promise<string> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/chef/status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.status;
    } catch {
      throw new Error('Failed to check chef status');
    }
  };

  // Follow User
  const followUser = async (userId: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/follow/`, 
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch {
      throw new Error('Failed to follow user');
    }
  };

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is due to an expired token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${BaseUrl}api/auth/token/refresh/`, { refresh: refreshToken });
            toast.success("Token refreshed successfully");
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, log out the user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    token,
    login,
    googleLogin,
    register,
    registerChef,
    logout,
    forgotPassword,
    resetPassword,
    getUserProfile,
    getChefProfile,
    checkChefStatus,
    followUser,
    isAuthenticated,
    userRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};