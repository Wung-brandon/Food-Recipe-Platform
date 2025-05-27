// Add these utility functions to your AuthContext or create a separate utils file

// Utility function to get a fresh token (handles refresh automatically)
// import { useAuth } from "../context/AuthContext";
import { jwtDecode } from 'jwt-decode';
export const getFreshToken = async () => {
  const BaseUrl = "http://127.0.0.1:8000/";
  const currentToken = localStorage.getItem('access_token');
  
  if (!currentToken) {
    throw new Error('No token found');
  }
  
  // Check if token is expired
  try {
    const decoded = jwtDecode(currentToken);
    const currentTime = Date.now() / 1000;
    
    // If token expires in the next 5 minutes, refresh it
    if (decoded.exp && decoded.exp < (currentTime + 300)) {
      console.log('Token expires soon, refreshing...');
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }
      
      const refreshResponse = await fetch(`${BaseUrl}api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newToken = refreshData.access;
        
        localStorage.setItem('access_token', newToken);
        return newToken;
      } else {
        throw new Error('Token refresh failed');
      }
    }
    
    return currentToken;
  } catch (error) {
    console.error('Token validation/refresh error:', error);
    throw error;
  }
};

// Enhanced API call function with automatic token refresh
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  try {
    // Get fresh token
    const token = await getFreshToken();
    
    // Add authorization header
    const headers = {
      ...(options.headers as Record<string, string> || {}),
      'Authorization': `Token ${token}`, // Use Token format for Django
    };
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // If still unauthorized after refresh, token might be invalid
    if (response.status === 401) {
      console.error('Authentication failed even after token refresh');
      localStorage.clear();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
    
    return response;
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'No refresh token found' || error.message === 'Token refresh failed') {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw error;
  }
};

// Simplified handleSubmit using the utility function
export const simplifiedHandleSubmit = async (e, recipe, validateForm, setLoading, toast, navigate) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }
  
  setLoading(true);
  
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Add all the form data (same as before)
    formData.append('title', recipe.title);
    formData.append('description', recipe.description);
    formData.append('preparation_time', recipe.preparation_time.toString());
    formData.append('cooking_time', recipe.cooking_time.toString());
    formData.append('servings', recipe.servings.toString());
    formData.append('difficulty', recipe.difficulty);
    formData.append('calories', recipe.calories.toString());
    formData.append('category', recipe.category);
    
    if (recipe.image) formData.append('image', recipe.image);
    if (recipe.video) formData.append('video', recipe.video);
    
    const validIngredients = recipe.ingredients.filter(ing => ing.name.trim() && ing.amount.trim());
    formData.append('ingredients', JSON.stringify(validIngredients));
    
    const validSteps = recipe.steps.filter(step => step.description.trim());
    formData.append('steps', JSON.stringify(validSteps));
    
    const validTips = recipe.tips.filter(tip => tip.trim());
    if (validTips.length > 0) {
      formData.append('tips', JSON.stringify(validTips.map(tip => ({ content: tip }))));
    }
    
    if (recipe.tags.length > 0) {
      formData.append('tags', JSON.stringify(recipe.tags));
    }
    
    // Use the authenticated fetch utility
    const response = await authenticatedFetch('http://localhost:8000/api/recipes/', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Recipe created successfully:', data);
      toast.success('Recipe created successfully!');
      navigate('/dashboard/chef/recipe');
    } else {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      
      if (response.status === 403) {
        if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0]);
        } else {
          toast.error('You are not authorized to create recipes.');
        }
      } else if (response.status === 400) {
        if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0]);
        } else {
          const errorMessage = Object.entries(errorData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors[0] : errors}`)
            .join(', ');
          toast.error(errorMessage);
        }
      } else {
        toast.error(`Server error (${response.status}). Please try again.`);
      }
    }
  } catch (error) {
    console.error('Error creating recipe:', error);
    if (error.message !== 'Authentication failed') {
      toast.error('Network error. Please check your connection and try again.');
    }
  } finally {
    setLoading(false);
  }
};