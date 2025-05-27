/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Interfaces for TypeScript
interface User {
  id: number;
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
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (email: string, password: string, confirm_password: string, username: string) => Promise<void>;
  registerChef: (
    email: string,
    password: string,
    confirmPassword: string,
    username: string,
    specialization: string,
    years_of_experience: string,
    certification_number: string,
    issuing_authority: string,
    has_accepted_terms: boolean,
    certification: File,
    identity_proof: File,
    food_safety_certification: File
  ) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const BaseUrl = "http://127.0.0.1:8000/"
  const navigate = useNavigate()

  // Check for existing token on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
    
      if (storedToken && storedUser) {
        try {
          const decoded = jwtDecode<User & { role?: string }>(storedToken);
          console.log("Decoded token:", decoded);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            // Token is expired, try to refresh
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const response = await axios.post(`${BaseUrl}api/auth/token/refresh/`, { 
                  refresh: refreshToken 
                });
                const { access } = response.data;
                localStorage.setItem('access_token', access);
                
                // Get updated user info
                const userResponse = await axios.get(`${BaseUrl}api/auth/user/`, {
                  headers: { Authorization: `Bearer ${access}` }
                });
                const userData = userResponse.data;
                
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setToken(access);
                setIsAuthenticated(true);
                setUserRole(userData.role || 'user');
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Clear invalid tokens
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
                setUserRole(null);
              }
            } else {
              // No refresh token, clear everything
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
              setUserRole(null);
            }
          } else {
            // Token is still valid
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
            setUserRole(parsedUser.role || 'user');
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          // Invalid token, clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        // No stored auth data
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/token/`, 
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const { access, refresh } = response.data;

      console.log("Login response:", response.data);
  
      // Ensure response data is valid
      if (!access || !refresh) {
        throw new Error("Invalid response from server");
      }
  
      // Store tokens in local storage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
  
      // Fetch user details
      const userResponse = await axios.get(`${BaseUrl}api/auth/user/`, {
        headers: { Authorization: `Bearer ${access}` }
      });
  
      const userData = userResponse.data;
      console.log("User data:", userData);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
  
      // Set user and authentication state
      setUser(userData);
      setToken(access);
      setIsAuthenticated(true);
      setUserRole(userData.role || 'user');
  
      // Navigate based on user role
      if (userData.role === 'admin') {
        navigate("/admin-dashboard");
      } else if (userData.role === 'CHEF') {
        navigate("/dashboard/chef");
      } else {
        navigate("/dashboard/user");
      }
  
      toast.success("Login Successful");
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error("Invalid credentials");
      } else if (error.message === "Invalid response from server") {
        toast.error("Unexpected server response. Please contact support.");
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
      toast.success("Registration Successful! You can now login.");
      navigate("/login");
      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Check if it's a 500 error related to email
      if (error.response?.status === 500) {
        // The user might be created but email failed
        toast.warning("Your account was created but we couldn't send a verification email. Please contact support.");
        navigate("/login");
        return;
      }
      
      handleRegistrationError(error);
      throw new Error('Registration failed');
    }
  };

  // Chef register function
  const registerChef = async (
    email: string,
    password: string,
    confirmPassword: string,
    username: string,
    specialization: string,
    years_of_experience: string,
    certification_number: string,
    issuing_authority: string,
    has_accepted_terms: boolean,
    certification: File,
    identity_proof: File,
    food_safety_certification: File
  ) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add user fields as a nested object
      const userData = {
        email,
        password,
        confirm_password: confirmPassword,
        username,
      };
      formData.append('user', JSON.stringify(userData));

      // Add chef profile data
      formData.append('specialization', specialization);
      formData.append('years_of_experience', years_of_experience);
      formData.append('certification_number', certification_number);
      formData.append('issuing_authority', issuing_authority);
      formData.append('has_accepted_terms', has_accepted_terms.toString());

      // Add files
      formData.append('certification', certification);
      formData.append('identity_proof', identity_proof);
      formData.append('food_safety_certification', food_safety_certification);

      console.log("Sending chef registration data:", {
        user: userData,
        specialization,
        years_of_experience,
        certification_number,
        issuing_authority,
        has_accepted_terms,
        files: {
          certification: certification?.name,
          identity_proof: identity_proof?.name,
          food_safety_certification: food_safety_certification?.name,
        },
      });

      // Send the request to the backend
      const response = await axios.post(`${BaseUrl}api/auth/chef/signup/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Chef registration response:", response.data);
      toast.success("Chef Registration Successful! Your application is pending approval.");
      return response.data;
    } catch (error: any) {
      console.error("Full error object:", error);

      // Enhanced error handling
      if (error.response?.data) {
        const errorData = error.response.data;

        // Handle field errors
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            toast.error(`${field}: ${messages[0]}`);
          }
          return; // Show only the first error
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("Error setting up request: " + error.message);
      }

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
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            setToken(access);
            
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
    isLoading,
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