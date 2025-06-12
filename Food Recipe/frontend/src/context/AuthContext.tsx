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
  role?: 'user' | 'chef' | 'admin';
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

interface GuestSession {
  sessionKey: string | null;
  isGuest: boolean;
  sessionExpiry: number | null;
}

interface AuthContextType extends GuestSession {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
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
  initializeGuestSession: () => void;
  clearGuestSession: () => void;
  getAuthHeaders: () => { [key: string]: string };
  mergeGuestCart: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  const BaseUrl = "http://127.0.0.1:8000/";
  const navigate = useNavigate();

  // Generate cryptographically secure session key
  const generateSecureSessionKey = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return `guest_${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
  };

  // Initialize guest session with expiry
  const initializeGuestSession = () => {
    if (!isAuthenticated) {
      const key = generateSecureSessionKey();
      const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      
      localStorage.setItem('guest_session_key', key);
      localStorage.setItem('guest_session_expiry', expiry.toString());
      
      setSessionKey(key);
      setSessionExpiry(expiry);
      setIsGuest(true);
    }
  };

  // Clear guest session
  const clearGuestSession = () => {
    localStorage.removeItem('guest_session_key');
    localStorage.removeItem('guest_session_expiry');
    setSessionKey(null);
    setSessionExpiry(null);
    setIsGuest(false);
  };

  // Check if guest session is expired
  const isGuestSessionExpired = (expiry: number): boolean => {
    return Date.now() > expiry;
  };

  // Get authentication headers for API calls
  const getAuthHeaders = (): { [key: string]: string } => {
    const headers: { [key: string]: string } = {};
    
    if (isAuthenticated && token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (isGuest && sessionKey && sessionExpiry && !isGuestSessionExpired(sessionExpiry)) {
      headers['X-Guest-Session'] = sessionKey;
    }
    
    return headers;
  };

  // Merge guest cart with user cart
  const mergeGuestCart = async (): Promise<void> => {
    if (!sessionKey || !isAuthenticated || !token) return;

    try {
      await axios.post(
        `${BaseUrl}api/shop/merge-guest-cart/`,
        { guest_session_key: sessionKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Guest cart merged successfully');
    } catch (error) {
      console.error('Failed to merge guest cart:', error);
      // Don't show error to user as this is background operation
    }
  };

  // Check for existing session on load
  useEffect(() => {
    const storedGuestKey = localStorage.getItem('guest_session_key');
    const storedExpiry = localStorage.getItem('guest_session_expiry');
    
    if (storedGuestKey && storedExpiry && !isAuthenticated) {
      const expiry = parseInt(storedExpiry);
      
      if (!isGuestSessionExpired(expiry)) {
        setSessionKey(storedGuestKey);
        setSessionExpiry(expiry);
        setIsGuest(true);
      } else {
        // Session expired, clear it
        clearGuestSession();
      }
    }
  }, [isAuthenticated]);

  // Auto-initialize guest session if user starts shopping
  useEffect(() => {
    const handleUserActivity = () => {
      if (!isAuthenticated && !isGuest) {
        initializeGuestSession();
      }
    };

    // Listen for user interactions that indicate shopping intent
    const events = ['click', 'scroll', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, isGuest]);

  // Check for existing token on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
    
      if (storedToken && storedUser) {
        try {
          const decoded = jwtDecode<User & { role?: string }>(storedToken);
          
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
                
                // Merge guest cart if exists
                if (sessionKey) {
                  await mergeGuestCart();
                  clearGuestSession();
                }
              } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
                setUserRole(null);
              }
            } else {
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
            
            // Merge guest cart if exists
            if (sessionKey) {
              await mergeGuestCart();
              clearGuestSession();
            }
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [sessionKey]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/token/`, 
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const userResponse = await axios.get(`${BaseUrl}api/auth/user/`, {
        headers: { Authorization: `Bearer ${access}` }
      });
      const userData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(access);
      setIsAuthenticated(true);
      setUserRole(userData.role || 'user');

      // Merge guest cart if exists
      if (sessionKey) {
        try {
          await axios.post(
            `${BaseUrl}api/shop/merge-guest-cart/`,
            { guest_session_key: sessionKey },
            { headers: { Authorization: `Bearer ${access}` } }
          );
          clearGuestSession();
        } catch (mergeError) {
          console.error('Failed to merge guest cart:', mergeError);
        }
      }

      // Navigate based on role
      if (userData.role === 'admin') {
        navigate("/admin-dashboard");
      } else if (userData.role === 'CHEF') {
        navigate("/dashboard/chef");
      } else {
        navigate("/dashboard/user");
      }
      
      toast.success("Login Successful");
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error("Invalid credentials");
      } else if (error.message === "Invalid response from server") {
        toast.error("Unexpected server response. Please contact support.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  // Register function (with cart merging)
  const register = async (email: string, password: string, confirm_password: string, username: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/signup/`, { 
        username,
        email,
        password,
        confirm_password
      });

      toast.success("Registration Successful! You can now login.");
      
      // After successful registration, user can login and cart will be merged
      navigate("/login");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 500) {
        toast.warning("Your account was created but we couldn't send a verification email. Please contact support.");
        navigate("/login");
        return;
      }
      
      handleRegistrationError(error);
      throw new Error('Registration failed');
    }
  };

  // Chef register function (unchanged - add similar logic if needed)
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
      const formData = new FormData();
      const userData = { email, password, confirm_password: confirmPassword, username };
      formData.append('user', JSON.stringify(userData));
      formData.append('specialization', specialization);
      formData.append('years_of_experience', years_of_experience);
      formData.append('certification_number', certification_number);
      formData.append('issuing_authority', issuing_authority);
      formData.append('has_accepted_terms', has_accepted_terms.toString());
      formData.append('certification', certification);
      formData.append('identity_proof', identity_proof);
      formData.append('food_safety_certification', food_safety_certification);

      const response = await axios.post(`${BaseUrl}api/auth/chef/signup/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success("Chef Registration Successful! Your application is pending approval.");
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            toast.error(`${field}: ${messages[0]}`);
            return;
          }
        }
      }
      toast.error("Chef registration failed. Please try again.");
      throw new Error('Chef registration failed');
    }
  };

  // Helper function to handle registration errors
  const handleRegistrationError = (error: any) => {
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.email) {
        toast.error(`Email: ${errorData.email[0]}`);
      } else if (errorData.username) {
        toast.error(`Username: ${errorData.username[0]}`);
      } else if (errorData.password) {
        toast.error(`Password: ${errorData.password[0]}`);
      } else if (errorData.confirm_password) {
        toast.error(`${errorData.confirm_password[0]}`);
      } else if (errorData.non_field_errors) {
        toast.error(errorData.non_field_errors[0]);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } else {
      toast.error("Registration failed. Please check your connection.");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Don't clear guest session on logout - user might want to continue shopping
    
    navigate("/login");
    toast.success("Logout Successful");
  };

  // Other functions remain the same...
  const forgotPassword = async (email: string) => {
    try {
      await axios.post(`${BaseUrl}api/auth/forgot-password/`, { email });
      toast.success('Reset Password link has been sent to your email');
    } catch {
      toast.error('Failed to send password reset link');
      throw new Error('Failed to send password reset link');
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
      await axios.post(`${BaseUrl}api/auth/reset-password/`, { 
        email, token, new_password: newPassword 
      });
      toast.success('Password reset successful! You can now log in with your new password.');
      navigate('/login');
    } catch {
      toast.error('Failed to reset password.');
      throw new Error('Failed to reset password');
    }
  };

  const getUserProfile = async (id: number): Promise<UserProfile> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/user/profile/${id}/`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch user profile');
    }
  };

  const getChefProfile = async (id: number): Promise<ChefProfile> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/chef/profile/${id}/`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch {
      throw new Error('Failed to fetch chef profile');
    }
  };

  const checkChefStatus = async (): Promise<string> => {
    try {
      const response = await axios.get(`${BaseUrl}api/auth/chef/status/`, {
        headers: getAuthHeaders()
      });
      return response.data.status;
    } catch {
      throw new Error('Failed to check chef status');
    }
  };

  const followUser = async (userId: string) => {
    try {
      const response = await axios.post(`${BaseUrl}api/auth/follow/`, 
        { user_id: userId },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch {
      throw new Error('Failed to follow user');
    }
  };

  // Axios interceptor for token refresh (unchanged)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await axios.post(`${BaseUrl}api/auth/token/refresh/`, { refresh: refreshToken });
            
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            setToken(access);
            
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

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
    userRole,
    sessionKey,
    isGuest,
    sessionExpiry,
    initializeGuestSession,
    clearGuestSession,
    getAuthHeaders,
    mergeGuestCart
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