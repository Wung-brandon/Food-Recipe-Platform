import React from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Share, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  recipe: import('../types/Recipe').RecipeData;
  currentUserId?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onToggleLike?: () => void;
  isFavorited?: boolean;
  isLiked?: boolean;
  showFavoriteButton?: boolean;
  showLikeButton?: boolean;
  dashboardType?: 'user' | 'chef';
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  currentUserId,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleLike,
  isFavorited = false,
  isLiked = false,
  showFavoriteButton = true,
  showLikeButton = true,
  dashboardType,
}) => {
  const navigate = useNavigate();

  // Routing: use dashboard routes if in dashboard, else public
  const recipeLink = dashboardType === 'chef'
    ? `/dashboard/chef/recipe/${recipe.id}`
    : dashboardType === 'user'
      ? `/dashboard/user/recipe/${recipe.id}`
      : `/recipe/${recipe.id}`;
  const categoryLink = `/category/${recipe.category}`;

  return (
    <motion.div
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={recipe.id}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={e => { e.stopPropagation(); navigate(recipeLink); }}
        />

        {/* Save/Favorite Button */}
        {showFavoriteButton && (
          <div className="absolute top-3 right-3">
            <motion.button
              className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-colors duration-200 ${
                isFavorited
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/80 text-gray-700 hover:bg-amber-100'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={e => { 
                e.stopPropagation(); 
                if (onToggleFavorite) onToggleFavorite(); 
              }}
            >
              {isFavorited ? (
                // Filled heart, colored
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              ) : (
                // Outline heart, gray
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              )}
            </motion.button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className="text-xs font-semibold text-white px-3 py-1 bg-black/60 backdrop-blur-sm cursor-pointer hover:bg-amber-600 rounded-full transition-colors duration-200"
            onClick={e => { e.stopPropagation(); navigate(categoryLink); }}
          >
            {recipe.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Header with Title and Actions */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-3">
            <h3
              className="font-bold text-lg text-gray-800 hover:text-amber-600 cursor-pointer line-clamp-2 transition-colors duration-200"
              onClick={e => { e.stopPropagation(); navigate(recipeLink); }}
            >
              {recipe.title}
            </h3>
          </div>

          {/* Owner Actions */}
          {dashboardType === 'chef' && (
            <div className="flex items-center gap-1 ml-2">
              <Tooltip title="Edit Recipe">
                <IconButton
                  size="small"
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={e => { e.stopPropagation(); if (onEdit) onEdit(); }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Recipe">
                <IconButton
                  size="small"
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                  onClick={e => { e.stopPropagation(); if (onDelete) onDelete(); }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Recipe Meta Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{recipe.cookTime} min</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{recipe.difficulty}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-700">{recipe.rating}</span>
            <span className="ml-1 text-xs text-gray-500">({recipe.reviewCount})</span>
          </div>
        </div>

        {/* Bottom Section - Author and Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          {/* Author Info */}
          <div
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={e => { e.stopPropagation(); }}
          >
            <Avatar
              src={recipe.author.avatarUrl}
              alt={recipe.author.name}
              sx={{ width: 32, height: 32 }}
              className="mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{recipe.author.name}</p>
              <p className="text-xs text-gray-500">Chef</p>
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex items-center space-x-2">
            {/* Like Button */}
            {showLikeButton && (
              <Tooltip title={isLiked ? "Unlike" : "Like"}>
                <motion.button
                  className={`flex items-center px-3 py-1 rounded-full transition-colors duration-200 ${
                    isLiked
                      ? 'bg-red-100 text-red-500'
                      : 'hover:bg-gray-50 text-gray-400'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  onClick={e => { 
                    e.stopPropagation(); 
                    if (onToggleLike) onToggleLike(); 
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    viewBox="0 0 20 20"
                    fill={isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-xs font-medium text-gray-600">
                    {recipe.likeCount}
                  </span>
                </motion.button>
              </Tooltip>
            )}

            {/* Share Button */}
            <Tooltip title="Share Recipe">
              <IconButton
                size="small"
                className="text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                onClick={e => { e.stopPropagation(); }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;