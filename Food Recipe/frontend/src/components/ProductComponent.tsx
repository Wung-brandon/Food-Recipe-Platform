// Product Card Component
import React, { useState } from 'react';
import { 
  Star, 
  StarHalf,
  FavoriteBorder,
  Favorite,
} from '@mui/icons-material';
import { Product } from '../types/Products';
import { Link } from 'react-router-dom';

// Add prop to indicate platform ingredient context
interface ProductCardProps {
  item: Product;
  isPlatformIngredient?: boolean;
  buttonTitle?: string;
  platformIngredientLink?: string;
  detailsRoute?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, isPlatformIngredient, buttonTitle, platformIngredientLink }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const price = parseFloat(item.price);
  const rating = 4.0 + Math.random() * 1; // Simulated rating since not in API
  const reviewCount = Math.floor(Math.random() * 200) + 10; // Simulated reviews

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="relative">
        {/* Product image */}
        <img 
          src={item.image_url} 
          alt={item.name} 
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/api/placeholder/300/300";
          }}
        />
        
        {/* Favorite button */}
        <button 
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          {isFavorite ? (
            <Favorite className="text-red-500" fontSize="small" />
          ) : (
            <FavoriteBorder className="text-gray-500" fontSize="small" />
          )}
        </button>
        
        {/* New/Featured badge for recent items */}
        {new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-md">
            NEW
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          {isPlatformIngredient ? (
            <Link to={platformIngredientLink || `/platform-ingredients/${item.id}`} className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-gray-950 leading-5">
              {item.name}
            </Link>
          ) : (
            item.amazon_url || item.source_url ? (
              <Link to={item.amazon_url || item.source_url} target="_blank" className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-gray-950 leading-5">
                {item.name}
              </Link>
            ) : (
              <span className="font-semibold text-gray-800 text-sm line-clamp-2 leading-5">{item.name}</span>
            )
          )}
        </div>
        
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
          {item.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => {
              if (i < Math.floor(rating)) 
                return <Star key={i} fontSize="small" />;
              else if (i < Math.ceil(rating)) 
                return <StarHalf key={i} fontSize="small" />;
              return <Star key={i} fontSize="small" className="text-gray-300" />;
            })}
          </div>
          <span className="text-xs text-gray-500 ml-2">({reviewCount})</span>
        </div>
        
        {/* Price and Add to Cart */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-end">
            {isPlatformIngredient ? (
              <span className="font-bold text-xl text-gray-800">{price.toLocaleString()} FCFA</span>
            ) : (
              <span className="font-bold text-xl text-gray-800">${price.toFixed(2)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {buttonTitle && (
            isPlatformIngredient ? (
              <Link
                to={platformIngredientLink || `/platform-ingredients/${item.id}`}
                className="px-4 py-2 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors w-full text-center"
              >
                {buttonTitle}
              </Link>
            ) : item.amazon_url || item.source_url ? (
              <a
                href={item.amazon_url || item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors w-full text-center"
              >
                {buttonTitle}
              </a>
            ) : (
              <button
                className="px-4 py-2 bg-orange-500 text-white text-xs rounded-md hover:bg-orange-600 transition-colors w-full text-center"
                disabled
              >
                {buttonTitle}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;