/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/recipeHelpers.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Recipe } from '../types/Recipe';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

export interface SharePlatformData {
  platform: string;
  recipeId: string;
  userId?: string;
}

// PDF Generation Helper
export const generateRecipePDF = async (recipe: Recipe): Promise<void> => {
  try {
    const pdfContainer = document.createElement('div');
    pdfContainer.className = 'pdf-container';
    pdfContainer.style.width = '700px';
    pdfContainer.style.padding = '20px';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    
    pdfContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; color: #333;">${recipe.title}</h1>
        <p style="color: #666;">By ${recipe.author.name}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <img src="${recipe.image}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;" />
      </div>
      <div style="margin-bottom: 20px;">
        <p>${recipe.description}</p>
      </div>
      <div style="display: flex; gap: 15px; margin-bottom: 20px;">
        <div style="flex: 1; text-align: center; padding: 10px; background: #f9f5eb; border-radius: 5px;">
          <p style="font-weight: bold;">Prep Time</p>
          <p>${recipe.preparationTime} min</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; background: #f9f5eb; border-radius: 5px;">
          <p style="font-weight: bold;">Cook Time</p>
          <p>${recipe.cookingTime} min</p>
        </div>
        <div style="flex: 1; text-align: center; padding: 10px; background: #f9f5eb; border-radius: 5px;">
          <p style="font-weight: bold;">Servings</p>
          <p>${recipe.servings}</p>
        </div>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; color: #333;">Ingredients</h2>
        <ul style="padding-left: 20px;">
          ${recipe.ingredients.map(ing => `<li>${ing.amount} ${ing.name}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; color: #333;">Instructions</h2>
        <ol style="padding-left: 20px;">
          ${recipe.steps.map(step => `<li style="margin-bottom: 10px;">${step.description}</li>`).join('')}
        </ol>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 20px; color: #333;">Chef's Tips</h2>
        <ul style="padding-left: 20px;">
          ${recipe.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>Downloaded from PerfectRecipe.com on ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    document.body.appendChild(pdfContainer);
    
    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    
    const pageHeight = 297;
    while (position < imgHeight) {
      position += pageHeight - 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
    }
    
    pdf.save(`${recipe.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    document.body.removeChild(pdfContainer);
    
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try again later.');
    throw error;
  }
};

// Share Recipe Helper with Backend Integration
export const shareRecipe = async (
  platform: string, 
  recipe: Recipe, 
  userId?: string
): Promise<void> => {
  const recipeUrl = window.location.href;
  const recipeTitle = recipe.title;
  const recipeDescription = recipe.description.substring(0, 100) + '...';
  
  try {
    // Track share in backend
    await axios.post(`${API_BASE_URL}/api/recipes/${recipe.id}/share/`, {
      platform: platform.toLowerCase(),
      user_id: userId || null,
    });

    // Also track the share event
    await axios.post(`${API_BASE_URL}/api/track-share/`, {
      recipe_id: recipe.id,
      platform: platform.toLowerCase(),
      user_id: userId || null,
      shared_at: new Date().toISOString(),
    });

    // Handle platform-specific sharing
    switch (platform) {
      case 'Facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, 
          '_blank'
        );
        break;
      case 'Twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(recipeTitle)}&url=${encodeURIComponent(recipeUrl)}`, 
          '_blank'
        );
        break;
      case 'WhatsApp':
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(recipeTitle + ' - ' + recipeUrl)}`, 
          '_blank'
        );
        break;
      case 'Pinterest':
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(recipeUrl)}&media=${encodeURIComponent(recipe.image)}&description=${encodeURIComponent(recipeTitle)}`, 
          '_blank'
        );
        break;
      case 'Email':
        window.open(
          `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(recipeDescription + '\n\nCheck out the full recipe here: ' + recipeUrl)}`, 
          '_blank'
        );
        break;
      case 'Copy Link':
        await navigator.clipboard.writeText(recipeUrl);
        toast.success('Recipe link copied to clipboard!');
        break;
      default:
        console.log(`Sharing to ${platform} not implemented yet`);
    }
    
    toast.success(`Recipe shared to ${platform} successfully!`);
  } catch (error: any) {
    console.error('Error sharing recipe:', error);
    // Still allow sharing even if backend tracking fails
    toast.warning('Recipe shared, but tracking failed.');
    
    // Fallback: still open the share window
    switch (platform) {
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`, '_blank');
        break;
      case 'Twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(recipeTitle)}&url=${encodeURIComponent(recipeUrl)}`, '_blank');
        break;
      case 'WhatsApp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(recipeTitle + ' - ' + recipeUrl)}`, '_blank');
        break;
      case 'Pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(recipeUrl)}&media=${encodeURIComponent(recipe.image)}&description=${encodeURIComponent(recipeTitle)}`, '_blank');
        break;
      case 'Email':
        window.open(`mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(recipeDescription + '\n\nCheck out the full recipe here: ' + recipeUrl)}`, '_blank');
        break;
      case 'Copy Link':
        try {
          await navigator.clipboard.writeText(recipeUrl);
          toast.success('Recipe link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Failed to copy link: ', clipboardError);
          toast.error('Failed to copy link to clipboard.');
        }
        break;
    }
  }
};

// Print Recipe Helper
export const printRecipe = (): void => {
  window.print();
};

// Format Date Helper
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Just now';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

// Toggle Favorite Helper
export const toggleRecipeFavorite = async (
  recipeId: string, 
  isFavorite: boolean, 
  userId?: string
): Promise<boolean> => {
  try {
    const endpoint = isFavorite 
      ? `${API_BASE_URL}/api/recipes/${recipeId}/unfavorite/`
      : `${API_BASE_URL}/api/recipes/${recipeId}/favorite/`;
    
    await axios.post(endpoint, { user_id: userId });
    
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    return !isFavorite;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('Failed to update favorite status');
    return isFavorite;
  }
};

// Get User Info Helper (to determine user type and authentication status)
export const getUserInfo = (): { 
  isAuthenticated: boolean; 
  userType: 'user' | 'chef' | null; 
  userId: string | null;
  userData: any;
} => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user') || localStorage.getItem('userData');
    
    if (!token || !userData) {
      return {
        isAuthenticated: false,
        userType: null,
        userId: null,
        userData: null
      };
    }
    
    const user = JSON.parse(userData);
    return {
      isAuthenticated: true,
      userType: user.is_chef || user.userType === 'chef' ? 'chef' : 'user',
      userId: user.id || user.user_id,
      userData: user
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      isAuthenticated: false,
      userType: null,
      userId: null,
      userData: null
    };
  }
};