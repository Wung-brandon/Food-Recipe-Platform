import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RecipeData from '../types/Recipe';
import { 
  Avatar,
  IconButton, 
  Tooltip,
  
 } from '@mui/material';
import { Share } from '@mui/icons-material';
import { Link } from 'react-router-dom';


// const RecipeCard: React.FC<{ recipe: RecipeData }> = ({ recipe }) => {
//   return (
//     <Card className="h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
//       {/* Recipe Image with Bookmark Button */}
//       <div className="relative overflow-hidden group">
//         <CardMedia
//           component="img"
//           height="400"
//           image={recipe.imageUrl}
//           alt={recipe.title}
//           className="object-cover w-full h-80 transition-transform duration-300 group-hover:scale-105"
//         />

//         {/* Bookmark Button */}
//         <div className="absolute top-2 right-2">
//           <Tooltip title="Favorites">
//             <IconButton className="bg-white/80 hover:bg-white" size="small">
//               {recipe.isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
//             </IconButton>
//           </Tooltip>
//         </div>

//         {/* Cooking Time */}
//         <div className="absolute bottom-2 left-2">
//           <Chip
//             icon={<Timer fontSize="small" />}
//             label={`${recipe.cookTime} mins`}
//             size="small"
//             className="bg-black text-white backdrop-blur-sm"
//           />
//         </div>

//         {/* Difficulty */}
//         <div className="absolute bottom-2 right-2">
//           <Chip
//             label={recipe.difficulty}
//             size="small"
//             sx={{
//               backgroundColor: recipe.difficulty === 'Easy' ? '#10B981' : 
//                               recipe.difficulty === 'Medium' ? '#F59E0B' : 
//                               recipe.difficulty === 'Hard' ? '#EF4444' : '#6B7280',
//               color: 'white',
//               fontWeight: 'bold'
//             }}
//           />
//         </div>
//       </div>

//       <CardContent className="flex flex-col h-[180px]">
//         {/* Recipe Category */}
//         <Typography 
//           variant="h6" 
//           component="h2" 
//           className="font-bold line-clamp-2 mb-1 text-gray-700 hover:underline transition-colors cursor-pointer"
//           sx={{ fontSize: '1.5rem' }}
//         >
//           {recipe.category}
//         </Typography>

//         {/* Recipe Title */}
//         <Typography 
//           variant="h6" 
//           component="h5" 
//           className="line-clamp-2 mb-1 text-amber-600 hover:underline transition-colors cursor-pointer"
//           sx={{ fontSize: '1rem' }}
//         >
//           {recipe.title}
//         </Typography>

//         {/* Rating */}
//         <div className="flex items-center mb-3">
//           <Rating value={Number(recipe.rating)} precision={0.5} size="small" readOnly />
//           <Typography variant="body2" className="ml-1 text-gray-600">
//             ({recipe.reviewCount} Reviews) 
//           </Typography>
//         </div>

//         {/* Author Info */}
//         <div className="flex items-center mt-auto">
//           <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
//             <img 
//               src={recipe.author.avatarUrl} 
//               alt={recipe.author.name} 
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <Typography variant="body2" className="text-gray-800 font-medium ml-2">
//             {recipe.author.name}
//           </Typography>

//           {/* Like Button */}
//           <div className="ml-auto flex items-center">
//             <Tooltip title="Like">
//               <IconButton size="small">
//                 {recipe.isLiked ? <Favorite fontSize="small" className="text-rose-500" /> : <FavoriteBorder fontSize="small" />}
//               </IconButton>
//             </Tooltip>
//             <Typography variant="caption" className="text-gray-600">
//               {recipe.likeCount}
//             </Typography>
//           </div>

//           {/* Share Button */}
//           <div className="ml-2">
//             <Tooltip title="Share">
//               <IconButton size="small">
//                 <Share fontSize="small" />
//               </IconButton>
//             </Tooltip>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

const RecipeCard: React.FC<{ recipe: any }> = ({ recipe }) => {
  const [liked, setLiked] = useState(recipe.isLiked);
  const [saved, setSaved] = useState(recipe.isSaved);
  
  return (
    <motion.div 
      className="bg-white rounded-xl overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={recipe.id}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <motion.button 
            className={`p-1 rounded-full ${saved ? 'bg-amber-600 text-white' : 'bg-white text-gray-600'}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(!saved)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>
        </div>
      </div>
      
      <div className="p-4">
      <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-amber-600 px-2 py-1 bg-amber-100 rounded-full">
            {recipe.category}
          </span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500">{recipe.cookTime} min</span>
            <span className="mx-1 text-gray-300">•</span>
            <span className="text-xs text-gray-500">{recipe.difficulty}</span>
          </div>
        </div>
        
        <Link to={`/recipe/${recipe.id}`} className='no-underline '>
          <h3 className="font-bold text-lg mb-1 text-gray-800 hover:text-amber-600 cursor-pointer ">{recipe.title}</h3>
        </Link>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-700">{recipe.rating}</span>
            <span className="mx-1 text-xs text-gray-500">({recipe.reviewCount} Reviews)</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Avatar 
              src={recipe.author.avatarUrl} 
              alt={recipe.author.name}
              className="w-6 h-6"
              sx={{ width: 24, height: 24 }}
            />
            <span className="ml-2 text-xs text-gray-600">{recipe.author.name}</span>
          </div>
          
          <div className="flex items-center">
            <Tooltip title="Like">
              <motion.button 
                className="mr-2 flex items-center"
                whileTap={{ scale: 0.9 }}
                onClick={() => setLiked(!liked)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${liked ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                  viewBox="0 0 20 20" 
                  fill={liked ? "currentColor" : "none"} 
                  stroke="currentColor"
                >
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-xs text-gray-500">{liked ? recipe.likeCount + 1 : recipe.likeCount}</span>
              </motion.button>
            </Tooltip>
            <span className="text-xs text-gray-400">
              <Tooltip title="Share">
                <IconButton size="small">
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;
