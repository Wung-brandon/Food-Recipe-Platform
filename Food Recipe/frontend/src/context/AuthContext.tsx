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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (email: string, password: string, confirm_password: string, username?: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  getUserProfile: () => Promise<UserProfile>;
  isAuthenticated: boolean;
}

interface UserProfile {
  full_name: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  profile_picture?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const BaseUrl = "http://127.0.0.1:8000/"
  const navigate = useNavigate()

  // Check for existing token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        setUser(decoded);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error:any) {
        // Invalid token, clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BaseUrl}api/auth/login/`, 
            { email, password },
            { headers: { "Content-Type": "application/json" } }
        );
        
        const { access, refresh, user: userData } = response.data;

        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Set user and authentication state
        setUser(userData);
        setToken(access);
        setIsAuthenticated(true);
        
        // Navigate first, then show toast
        navigate("/dashboard");
        setTimeout(() => {
            toast.success("Login Successful");
        }, 100);
    } catch (error: any) {
        // Check for specific error responses
        if (error.response?.status === 401 || error.response?.status === 400) {
            toast.error("Invalid credentials");
        } else {
            toast.error("Login failed. Please try again.");
        }
        // Don't throw an error here, as it might be causing cascade issues
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

      // Set user and authentication state
      setUser(userData);
      setToken(access);
      setIsAuthenticated(true);
    } catch (error:any) {
      throw new Error('Google login failed');
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string, confirm_password: string ) => {
    console.log("Sending registration data:", { username, email, password, confirm_password });

    try {
        const response = await axios.post(`${BaseUrl}api/auth/register/`, { 
            username,
            email,
            password,
            confirm_password 
        });

        console.log("Response received:", response.data);

        const { access, refresh, user: userData } = response.data;

        // Store tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Set user and authentication state
        setUser(userData);
        setToken(access);
        setIsAuthenticated(true);
        navigate("/login");
        toast.success("Registration Successful");
    } catch (error: any) {
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
        
        throw new Error('Registration failed');
    }
};

  // Logout function
  const logout = () => {
    // Clear tokens from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Reset state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    navigate("/login")
    toast.success("Logout Successful")
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`${BaseUrl}api/auth/forgot-password/`, { email });
      toast.success('Reset Password link has been sent to your email');
    } catch (error:any) {
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
      navigate('/login'); // Navigate to login page after successful reset
    } catch (error:any) {
      toast.error('Failed to reset password.');
      throw new Error('Failed to reset password');
    }
  };

  // Follow User
  const followUser = async (userId: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/follow-user/`, { user_id: userId });
      return response.data;

    } catch (error:any) {
      throw new Error('Failed to follow user');
    }
  };

  // Get User Profile
  const getUserProfile = async (): Promise<UserProfile> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/user-profile/`);
      return response.data;
    } catch (error:any) {
      throw new Error('Failed to fetch user profile');
    }
  };

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is due to an expired token
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${BaseUrl}api/token/refresh/`, { refresh: refreshToken });
            
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
    logout,
    forgotPassword,
    resetPassword,
    followUser,
    getUserProfile,
    isAuthenticated
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