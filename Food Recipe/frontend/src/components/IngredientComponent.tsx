import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  AddShoppingCart, 
  Visibility, 
  Launch,
  LocalOffer
} from '@mui/icons-material';

interface Ingredient {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  source_url: string;
  price: string;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

interface IngredientCardProps {
  item: Ingredient;
  onAddToCart?: (ingredient: Ingredient) => void;
  onViewDetails?: (ingredient: Ingredient) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ 
  item, 
  onAddToCart, 
  onViewDetails 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Format the image URL (handle protocol-relative URLs)
  const getImageUrl = (url: string) => {
    if (url.startsWith('//')) {
      return `https:${url}`;
    }
    return url;
  };

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  // Handle external link
  const handleViewSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.source_url, '_blank', 'noopener,noreferrer');
  };

  // Truncate long names
  const truncateName = (name: string, maxLength: number = 40) => {
    return name.length <= maxLength ? name : `${name.substring(0, maxLength)}...`;
  };

  // Format price display
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`;
  };

  return (
    <Card 
      className={`w-full max-w-sm bg-white rounded-xl shadow-md transition-all duration-300 cursor-pointer ${
        isHovered ? 'shadow-xl transform -translate-y-1' : ''
      } hover:shadow-xl hover:-translate-y-1`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {!imageError ? (
          <CardMedia
            component="img"
            height="200"
            image={getImageUrl(item.image_url)}
            alt={item.name}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <LocalOffer className="text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500 text-sm">No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Overlay buttons */}
        <div className={`absolute top-2 right-2 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Tooltip title="View Source">
            <IconButton
              size="small"
              className="bg-white/90 text-green-600 hover:bg-white hover:text-green-700 shadow-md"
              onClick={handleViewSource}
            >
              <Launch fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Price tag */}
        <div className="absolute bottom-2 left-2">
          <Chip
            label={formatPrice(item.price)}
            className="bg-green-600 text-white font-semibold shadow-md"
            size="small"
          />
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Name */}
          <div>
            <Tooltip title={item.name} placement="top">
              <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                {truncateName(item.name)}
              </h3>
            </Tooltip>
          </div>

          {/* Unit (if available) */}
          {item.unit && (
            <div>
              <Chip
                label={item.unit}
                variant="outlined"
                size="small"
                className="text-gray-600 border-gray-300"
              />
            </div>
          )}

          {/* Description (if available) */}
          {item.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddShoppingCart />}
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              className="text-green-600 border-green-600 hover:bg-green-50 rounded-lg min-w-fit px-3"
              onClick={handleViewDetails}
            >
              <Visibility />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Footer with metadata */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>ID: {item.id}</span>
          <span>
            Added: {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default IngredientCard;