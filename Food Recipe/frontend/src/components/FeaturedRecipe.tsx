import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Rating, 
  Chip, 
  IconButton, 
  Box,
  Tooltip 
} from '@mui/material';
import { Bookmark, BookmarkBorder, Timer, Favorite, FavoriteBorder, Share } from '@mui/icons-material';
import { 
    spaghetti,
    ekwang,
    katikati,
    njama,
    pizza,
    hamburger,
    ndole,
    achu,
    oslun,
    pepperBeef
 } from './images';
// Static Data
const recipes = [
  {
    id: 1,
    title: "Jollof Rice",
    category: "Desserts",
    imageUrl: spaghetti,
    cookTime: 45,
    difficulty: "Medium",
    rating: 4.5,
    reviewCount: 120,
    author: {
      name: "Chef Aisha",
      avatarUrl: spaghetti
    },
    isSaved: false,
    isLiked: false,
    likeCount: 50,
    createdAt: "2023-01-15"
  },
  {
    id: 2,
    title: "Sushi",
    imageUrl: ekwang,
    category: "Desserts",
    cookTime: 30,
    difficulty: "Hard",
    rating: 4.8,
    reviewCount: 200,
    author: {
      name: "Chef Kenji",
      avatarUrl: ekwang
    },
    isSaved: true,
    isLiked: true,
    likeCount: 150,
    createdAt: "2023-02-10"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    imageUrl: ndole,
    category: "Desserts",
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: ndole
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
  {
    id: 4,
    title: "Tacos",
    imageUrl: achu,
    category: "Desserts",
    cookTime: 15,
    difficulty: "Easy",
    rating: 4.7,
    reviewCount: 150,
    author: {
      name: "Chef Juan",
      avatarUrl: achu
    },
    isSaved: true,
    isLiked: true,
    likeCount: 100,
    createdAt: "2023-03-20"
  },
  {
    id: 2,
    title: "Sushi",
    imageUrl: pizza,
    category: "Desserts",
    cookTime: 30,
    difficulty: "Hard",
    rating: 4.8,
    reviewCount: 200,
    author: {
      name: "Chef Kenji",
      avatarUrl: pizza
    },
    isSaved: true,
    isLiked: true,
    likeCount: 150,
    createdAt: "2023-02-10"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    category: "Desserts",
    imageUrl: oslun,
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: oslun
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
  {
    id: 4,
    title: "Tacos",
    imageUrl: katikati,
    category: "Desserts",
    cookTime: 15,
    difficulty: "Easy",
    rating: 4.7,
    reviewCount: 150,
    author: {
      name: "Chef Juan",
      avatarUrl: katikati
    },
    isSaved: true,
    isLiked: true,
    likeCount: 100,
    createdAt: "2023-03-20"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    category: "Desserts",
    imageUrl: pepperBeef,
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: pepperBeef
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
];

const FeaturedRecipes: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {recipes.map((recipe) => (
        <motion.div key={recipe.id} variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
          <Card className="h-full rounded-xl overflow-hidden shadow-lg hover:shadow-lg transition-all duration-300 ">
            {/* Recipe Image with Bookmark Button */}
            <div className="relative overflow-hidden group">
              <CardMedia
                component="img"
                height="400"
                image={recipe.imageUrl}
                alt={recipe.title}
                className="object-cover w-full h-80 transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Top right - Bookmark Button */}
              <div className="absolute top-2 right-2">
                <Tooltip title="Favorites">
                    <IconButton 
                    className="bg-white/80 hover:bg-white"
                    size="small"
                    >
                    {recipe.isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                </Tooltip>
              </div>
              
              {/* Bottom left - Time */}
              <div className="absolute bottom-2 left-2">
                <Chip
                  icon={<Timer fontSize="small" />}
                  label={`${recipe.cookTime} mins`}
                  size="small"
                  className="bg-black backdrop-blur-sm text-white"
                />
              </div>
              
              {/* Bottom right - Difficulty */}
              <div className="absolute bottom-2 right-2">
                <Chip
                  label={recipe.difficulty}
                  size="small"
                  className={`
                    bg-black
                    backdrop-blur-sm text-white
                    ${recipe.difficulty === 'Easy' ? 'bg-green-500/90' : ''}
                    ${recipe.difficulty === 'Medium' ? 'bg-amber-500/90' : ''}
                    ${recipe.difficulty === 'Hard' ? 'bg-red-500/90' : ''}
                  `}
                />
              </div>
            </div>
            
            <CardContent>
              {/* Recipe Category */}
              <Typography 
                variant="h6" 
                component="h2" 
                className="font-bold line-clamp-2 mb-1 text-gray-700 hover:underline transition-colors cursor-pointer"
                sx={{fontSize: '1.5rem'}}
              >
                {recipe.category}
              </Typography>
              {/* Recipe Title */}
              <Typography 
                variant="h6" 
                component="h5" 
                className="line-clamp-2 mb-1 text-amber-600 hover:underline transition-colors cursor-pointer"
                sx={{fontSize: '1rem'}}
              >
                {recipe.title}
              </Typography>
              
              {/* Rating */}
              <div className="flex items-center mb-3">
                <Rating 
                  value={recipe.rating} 
                  precision={0.5} 
                  size="small" 
                  readOnly 
                />
                <Typography variant="body2" className="ml-1 text-gray-600">
                  ({recipe.reviewCount} Reviews) 
                </Typography>
              </div>
              
              {/* Author Info */}
              <div className="flex items-center mt-3">
                <div className="w-8 h-full rounded-full overflow-hidden mr-2">
                  <img 
                    src={recipe.author.avatarUrl} 
                    alt={recipe.author.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Typography variant="body2" className="text-gray-800 font-medium">
                    {recipe.author.name}
                  </Typography>
                  
                </div>
                {/* Like Button */}
                <div className="ml-auto flex items-center">
                    <Tooltip title="Like">
                        <IconButton size="small">
                            {recipe.isLiked ? 
                            <Favorite fontSize="small" className="text-rose-500" /> : 
                            <FavoriteBorder fontSize="small" />
                            }
                        </IconButton>
                    </Tooltip>
                  <Typography variant="caption" className="text-gray-600">
                    {recipe.likeCount}
                  </Typography>
                </div>
                {/* Share Button */}
                <div className="ml-2">
                    <Tooltip title="Share">
                        <IconButton size="small">
                            <Share fontSize="small" />
                        </IconButton>
                    </Tooltip>
                  
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeaturedRecipes;