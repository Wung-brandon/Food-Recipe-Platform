import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Typography, 
  Rating, 
  Avatar, 
  Button, 
  TextField, 
  Checkbox, 
  IconButton, 
  Dialog, 
  DialogContent, 
  Tabs, 
  Tab, 
  Box,
  Skeleton,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  AccessTime, 
  LocalDining, 
  Share, 
  PictureAsPdf, 
  PlayArrow, 
  Pause, 
  Refresh, 
  Message, 
  Print,
  Star,
  FavoriteBorder,
  Favorite,
  RestaurantMenu,
  ShoppingBasket,
  Info,
  Close,
  Restaurant
} from '@mui/icons-material';
import TitleText from '../components/TitleText';
import { spaghetti } from '../components/images';

// Types
interface Ingredient {
  id: string;
  name: string;
  amount: string;
  checked: boolean;
}

interface Step {
  id: string;
  description: string;
  image?: string;
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  date: string;
  rating: number;
  content: string;
  likes: number;
  isLiked: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: string;
  calories: number;
  rating: number;
  ratingCount: number;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  ingredients: Ingredient[];
  steps: Step[];
  tips: string[];
  isFavorite: boolean;
  category: string;
  tags: string[];
}

interface RelatedRecipe {
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  rating: number;
}

// Timer component
const Timer: React.FC<{ minutes: number }> = ({ minutes }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  };

  const progress = 100 - ((timeLeft / (minutes * 60)) * 100);

  return (
    <motion.div 
      className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h6" className="font-semibold mb-3">
        Cooking Timer
      </Typography>
      
      <div className="relative mb-4">
        <CircularProgress 
          variant="determinate" 
          value={progress} 
          size={100} 
          thickness={4} 
          className="text-amber-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Typography variant="h5" className="font-mono">
            {formatTime()}
          </Typography>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <IconButton 
          onClick={toggleTimer}
          className={isActive ? "bg-red-100 hover:bg-red-200" : "bg-green-100 hover:bg-green-200"}
        >
          {isActive ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <IconButton 
          onClick={resetTimer}
          className="bg-gray-100 hover:bg-gray-200"
        >
          <Refresh />
        </IconButton>
      </div>
    </motion.div>
  );
};

const RecipeDetails: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedRecipes, setRelatedRecipes] = useState<RelatedRecipe[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showNutritionDialog, setShowNutritionDialog] = useState(false);

  // Mock data - in a real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRecipe: Recipe = {
        id: recipeId || 'recipe-1',
        title: 'Homemade Pancakes with Fresh Berries',
        description: 'Light and fluffy pancakes made from scratch, served with a medley of fresh berries and a drizzle of pure maple syrup. This classic breakfast treat is perfect for weekend brunches or special morning occasions.',
        image: spaghetti,
        preparationTime: 15,
        cookingTime: 20,
        servings: 4,
        difficulty: 'Easy',
        calories: 320,
        rating: 4.7,
        ratingCount: 128,
        author: {
          id: 'user-1',
          name: 'Chef Maria',
          avatar: spaghetti
        },
        ingredients: [
          { id: 'ing-1', name: 'All-purpose flour', amount: '2 cups', checked: false },
          { id: 'ing-2', name: 'Baking powder', amount: '2 tsp', checked: false },
          { id: 'ing-3', name: 'Salt', amount: '1/2 tsp', checked: false },
          { id: 'ing-4', name: 'Granulated sugar', amount: '3 tbsp', checked: false },
          { id: 'ing-5', name: 'Milk', amount: '1 1/2 cups', checked: false },
          { id: 'ing-6', name: 'Eggs', amount: '2 large', checked: false },
          { id: 'ing-7', name: 'Butter, melted', amount: '1/4 cup', checked: false },
          { id: 'ing-8', name: 'Vanilla extract', amount: '1 tsp', checked: false },
          { id: 'ing-9', name: 'Fresh berries (blueberries, strawberries, raspberries)', amount: '2 cups', checked: false },
          { id: 'ing-10', name: 'Maple syrup', amount: 'For serving', checked: false },
        ],
        steps: [
          { id: 'step-1', description: 'In a large bowl, whisk together the flour, baking powder, salt, and sugar.' },
          { id: 'step-2', description: 'In a separate bowl, whisk together the milk, eggs, melted butter, and vanilla extract.' },
          { id: 'step-3', description: 'Pour the wet ingredients into the dry ingredients and stir just until combined. Do not overmix; a few lumps are okay.' },
          { id: 'step-4', description: 'Let the batter rest for 10 minutes while you heat a large non-stick skillet or griddle over medium heat.' },
          { id: 'step-5', description: 'Lightly grease the skillet with butter or cooking spray. Pour 1/4 cup of batter onto the skillet for each pancake.' },
          { id: 'step-6', description: 'Cook until bubbles form on the surface and the edges look dry, about 2-3 minutes. Flip and cook for another 1-2 minutes until golden brown.' },
          { id: 'step-7', description: 'Transfer to a warm plate and repeat with the remaining batter.' },
          { id: 'step-8', description: 'Serve warm with fresh berries and maple syrup.' },
        ],
        tips: [
          'For extra fluffy pancakes, separate the eggs and whip the whites before folding them into the batter.',
          'If you don\'t have fresh berries, thawed frozen berries work well too.',
          'The batter can be made the night before and refrigerated for a quicker morning prep.',
          'Use a 1/4 cup measuring cup for consistent pancake size.',
        ],
        isFavorite: false,
        category: 'breakfast',
        tags: ['breakfast', 'pancakes', 'berries', 'brunch', 'sweet']
      };

      const mockRelatedRecipes: RelatedRecipe[] = Array(4).fill(null).map((_, index) => ({
        id: `related-${index}`,
        title: `Related ${mockRecipe.category} Recipe ${index + 1}`,
        image: spaghetti,
        cookingTime: Math.floor(Math.random() * 50) + 10,
        rating: 3 + Math.random() * 2,
      }));

      setRecipe(mockRecipe);
      setRelatedRecipes(mockRelatedRecipes);
      setLoading(false);
    }, 1500);
  }, [recipeId]);

  const toggleIngredientCheck = (id: string) => {
    if (!recipe) return;
    
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(ing => 
        ing.id === id ? { ...ing, checked: !ing.checked } : ing
      )
    });
  };

  const toggleFavorite = () => {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      isFavorite: !recipe.isFavorite
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment || !userRating) return;
    
    // In a real app, you would send this to your API
    console.log('Comment submitted:', { comment: newComment, rating: userRating });
    
    // Reset form
    setNewComment('');
    setUserRating(null);
    
    // Show success message or update UI
    alert('Thank you for your review!');
  };

  const handleShareRecipe = (platform: string) => {
    // In a real app, implement sharing functionality
    console.log(`Sharing recipe to ${platform}`);
    setShowShareDialog(false);
  };

  const handlePrintRecipe = () => {
    // In a real app, implement print functionality
    console.log('Printing recipe');
    window.print();
  };

  const handleDownloadPdf = () => {
    // In a real app, implement PDF download
    console.log('Downloading recipe as PDF');
  };

  const handleChatWithAuthor = () => {
    if (!recipe) return;
    navigate(`/chat/${recipe.author.id}`);
  };

  // Comments data
  const comments: Comment[] = [
    {
      id: 'comment-1',
      user: {
        name: 'Jessica Smith',
        avatar: spaghetti
      },
      date: '2 weeks ago',
      rating: 5,
      content: 'These pancakes were amazing! So fluffy and delicious. My family loved them and has requested I make them again this weekend.',
      likes: 12,
      isLiked: false
    },
    {
      id: 'comment-2',
      user: {
        name: 'Michael Johnson',
        avatar: spaghetti
      },
      date: '1 month ago',
      rating: 4,
      content: 'Great recipe! I added a bit of cinnamon to the batter and it turned out wonderful. Will definitely make again.',
      likes: 8,
      isLiked: true
    }
  ];

  // Nutrition data
  const nutritionInfo = {
    calories: 320,
    protein: '8g',
    carbs: '45g',
    fat: '12g',
    sugar: '18g',
    fiber: '2g',
    sodium: '380mg'
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton variant="rectangular" height={400} className="mb-8 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton variant="text" height={80} className="mb-4" />
            <Skeleton variant="text" height={60} className="mb-6" />
            
            <div className="flex gap-4 mb-8">
              {Array(4).fill(null).map((_, i) => (
                <Skeleton key={i} variant="rectangular" width={80} height={36} className="rounded-md" />
              ))}
            </div>
            
            <Skeleton variant="rectangular" height={200} className="mb-8 rounded-lg" />
            
            <div className="mb-8">
              <Skeleton variant="text" height={40} className="mb-4" />
              {Array(5).fill(null).map((_, i) => (
                <Skeleton key={i} variant="text" height={30} className="mb-2" />
              ))}
            </div>
          </div>
          
          <div>
            <Skeleton variant="rectangular" height={400} className="rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    navigate('/not-found');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden"
    >
      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Typography variant="h2" className="text-xl md:text-2xl lg:text-2xl font-bold text-white mb-3">
              {recipe.title}
            </Typography>
            <div className="flex items-center justify-center mb-4">
              <Rating value={recipe.rating} readOnly precision={0.5} className="text-amber-400" />
              <Typography className="text-white ml-2">
                ({recipe.ratingCount} reviews)
              </Typography>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {recipe.tags.map(tag => (
                <Chip label={tag} key={tag} className="bg-amber-500 text-white" />
              ))}
            </div>
          </motion.div>
        </div>
        <img 
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Button
                variant="outlined"
                startIcon={recipe.isFavorite ? <Favorite /> : <FavoriteBorder />}
                sx={{border: "2px solid #D97706", color: '#D97706'}}
                onClick={toggleFavorite}
                className={recipe.isFavorite ? "text-red-500 border-red-500" : ""}
              >
                {recipe.isFavorite ? 'Saved' : 'Save'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Share />}
                sx={{border: "2px solid #D97706", color: '#D97706'}}
                onClick={() => setShowShareDialog(true)}
              >
                Share
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrintRecipe}
                sx={{border: "2px solid #D97706", color: '#D97706'}}
              >
                Print
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={handleDownloadPdf}
                sx={{border: "2px solid #D97706", color: '#D97706'}}
              >
                PDF
              </Button>

              <Button
                variant="outlined"
                startIcon={<Restaurant />}
                sx={{border: "2px solid #D97706", color: '#D97706'}}
                onClick={() => setShowNutritionDialog(true)}
              >
                Nutrition Info
              </Button>
            </div>
            
            {/* Recipe Info Cards */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                variants={itemVariants}
                className="bg-amber-50 p-4 rounded-lg text-center"
              >
                <AccessTime className="text-amber-500 mb-2" />
                <Typography variant="body2" className="font-medium">Prep Time</Typography>
                <Typography variant="h6">{recipe.preparationTime} min</Typography>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-amber-50 p-4 rounded-lg text-center"
              >
                <LocalDining className="text-amber-500 mb-2" />
                <Typography variant="body2" className="font-medium">Cook Time</Typography>
                <Typography variant="h6">{recipe.cookingTime} min</Typography>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-amber-50 p-4 rounded-lg text-center"
              >
                <RestaurantMenu className="text-amber-500 mb-2" />
                <Typography variant="body2" className="font-medium">Servings</Typography>
                <Typography variant="h6">{recipe.servings}</Typography>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-amber-50 p-4 rounded-lg text-center"
              >
                <Info 
                  className="text-amber-500 mb-2 cursor-pointer" 
                  onClick={() => setShowNutritionDialog(true)}
                />
                <Typography variant="body2" className="font-medium">Calories</Typography>
                <Typography variant="h6">{recipe.calories}</Typography>
              </motion.div>
            </motion.div>
            
            {/* Author Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm mb-8"
            >
              <Avatar 
                src={recipe.author.avatar} 
                alt={recipe.author.name}
                className="w-16 h-16"
              />
              <div className="flex-1">
                <Typography variant="subtitle1" className="font-medium">
                  Recipe by {recipe.author.name}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Professional Chef
                </Typography>
              </div>
              <Button 
                variant="contained" 
                startIcon={<Message />}
                onClick={handleChatWithAuthor}
                sx={{backgroundColor: '#D97706'}}
              >
                Chat
              </Button>
            </motion.div>
            
            {/* Recipe Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <TitleText title='About This Recipe'/>
              <Typography variant="body1" className="text-gray-700 mb-6">
                {recipe.description}
              </Typography>
            </motion.div>
            
            {/* Tabs for Instructions, Ingredients, Reviews */}
            <Box className="mb-12">
              <Box className="border-b">
                <Tabs 
                  value={selectedTab} 
                  onChange={handleTabChange}
                  className="mb-6"
                >
                  <Tab label="Instructions" />
                  <Tab label="Ingredients" />
                  <Tab label="Reviews" />
                </Tabs>
              </Box>
              
              {/* Instructions Tab */}
              {selectedTab === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4"
                >
                  <TitleText title='Step by Step Instructions'/>
                  <ol className="space-y-6 mt-4">
                    {recipe.steps.map((step, index) => (
                      <motion.li 
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <Typography variant="body1">{step.description}</Typography>
                          {step.image && (
                            <img 
                              src={step.image} 
                              alt={`Step ${index + 1}`} 
                              className="mt-3 rounded-lg w-full max-w-md"
                            />
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                  
                  {/* Tips Section */}
                  <div className="mt-12 bg-amber-50 p-6 rounded-lg">
                    <TitleText title="Chef's Tips"/>
                    <ul className="mt-4 space-y-3">
                      {recipe.tips.map((tip, index) => (
                        <li key={index} className="flex gap-2">
                          <Star className="text-amber-500 flex-shrink-0 mt-1" />
                          <Typography variant="body1">{tip}</Typography>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
              
              {/* Ingredients Tab */}
              {selectedTab === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4"
                >
                  <div className="flex justify-between items-center mb-6">
                  <TitleText title='Ingredients'/>
                    <Button 
                      startIcon={<ShoppingBasket />}
                      variant="contained"
                      color="primary"
                    >
                      Add All to Shopping List
                    </Button>
                  </div>
                  
                  <ul className="space-y-2">
                    {recipe.ingredients.map(ingredient => (
                      <motion.li 
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center p-3 bg-white rounded-lg shadow-sm"
                      >
                        <Checkbox 
                          checked={ingredient.checked}
                          onChange={() => toggleIngredientCheck(ingredient.id)}
                          className="text-amber-500"
                        />
                        <div className="flex-1">
                          <Typography 
                            variant="body1" 
                            className={ingredient.checked ? "line-through text-gray-400" : ""}
                          >
                            {ingredient.name}
                          </Typography>
                        </div>
                        <Typography 
                          variant="body2" 
                          className={`mr-2 ${ingredient.checked ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {ingredient.amount}
                        </Typography>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              
              {/* Reviews Tab */}
              {selectedTab === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4"
                >
                  <div className="mb-8">
                    <TitleText title='Reviews & Ratings'/>
                    
                    <div className="flex items-end gap-4 mt-4">
                      <div className="text-center">
                        <Typography variant="h2" className="text-amber-500 font-bold">
                          {recipe.rating.toFixed(1)}
                        </Typography>
                        <Rating value={recipe.rating} readOnly precision={0.5} size="large" />
                        <Typography variant="body2" className="text-gray-600 mt-1">
                          {recipe.ratingCount} reviews
                        </Typography>
                      </div>
                      
                      <div className="flex-1 pl-6 border-l">
                        <div className="space-y-1">
                          {[5, 4, 3, 2, 1].map(stars => {
                            // Calculate percentage (mock data for demonstration)
                            const percentage = 
                              stars === 5 ? 65 : 
                              stars === 4 ? 25 : 
                              stars === 3 ? 7 : 
                              stars === 2 ? 2 : 1;
                            
                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <div className="flex items-center w-16">
                                  <span>{stars}</span>
                                  <Star className="text-amber-400 ml-1" fontSize="small" />
                                </div>
                                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-amber-400 h-full rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-10">
                                  {percentage}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Review */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <Typography variant="h6" className="mb-4">Leave a Review</Typography>
                    <form onSubmit={handleCommentSubmit}>
                      <div className="mb-4">
                        <Typography>Your Rating</Typography>
                        <Rating 
                          value={userRating} 
                          onChange={(_, value) => setUserRating(value)}
                          size="large"
                        />
                      </div>
                      <TextField 
                        label="Your Review"
                        multiline
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="mb-4"
                      />
                      <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={!newComment || !userRating}
                      >
                        Submit Review
                      </Button>
                    </form>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar src={comment.user.avatar} alt={comment.user.name} />
                            <div>
                              <Typography variant="subtitle1" className="font-medium">
                                {comment.user.name}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {comment.date}
                              </Typography>
                            </div>
                          </div>
                          <Rating value={comment.rating} readOnly size="small" />
                        </div>
                        <Typography variant="body1" className="my-4">
                          {comment.content}
                        </Typography>
                        <div className="flex items-center gap-2">
                          <IconButton 
                            size="small"
                            className={comment.isLiked ? "text-red-500" : ""}
                          >
                            {comment.isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                          </IconButton>
                          <Typography variant="body2" className="text-gray-600">
                            {comment.likes}
                          </Typography>
                        </div>
                        </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Box>
            
            {/* Related Recipes */}
            <div className="mt-16">
              <TitleText  title="You Might Also Like"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                {relatedRecipes.map(relatedRecipe => (
                  <motion.div
                    key={relatedRecipe.id}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md"
                  >
                    <img 
                      src={relatedRecipe.image} 
                      alt={relatedRecipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <Typography variant="h6" className="mb-2">
                        {relatedRecipe.title}
                      </Typography>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <AccessTime fontSize="small" className="text-gray-500 mr-1" />
                          <Typography variant="body2" className="text-gray-500">
                            {relatedRecipe.cookingTime} min
                          </Typography>
                        </div>
                        <Rating value={relatedRecipe.rating} readOnly size="small" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Timer Widget */}
            <Timer minutes={recipe.cookingTime} />
            
            {/* Servings Adjuster */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" className="font-semibold mb-4">
                Adjust Servings
              </Typography>
              <div className="flex items-center justify-between">
                <IconButton 
                  className="bg-amber-100 hover:bg-amber-200"
                  disabled={recipe.servings <= 1}
                >
                  -
                </IconButton>
                <Typography variant="h5">{recipe.servings}</Typography>
                <IconButton className="bg-amber-100 hover:bg-amber-200">
                  +
                </IconButton>
              </div>
            </motion.div>
            
            {/* Similar Categories */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Typography variant="h6" className="font-semibold mb-4">
                Similar Categories
              </Typography>
              <div className="flex flex-wrap gap-2">
                {['Breakfast', 'Lunch', 'Baked Foods', 'Desserts', 'Vegetarian'].map(category => (
                  <Chip 
                    key={category} 
                    label={category} 
                    className="bg-amber-100 hover:bg-amber-200 cursor-pointer"
                    onClick={() => navigate(`/category/${category.toLowerCase()}`)}
                  />
                ))}
              </div>
            </div>
            
            {/* Video Tutorial Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Typography variant="h6" className="font-semibold mb-4">
                Video Tutorial
              </Typography>
              <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <IconButton className="bg-white/80 hover:bg-white">
                    <PlayArrow fontSize="large" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog 
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Share This Recipe</Typography>
            <IconButton onClick={() => setShowShareDialog(false)}>
              <Close />
            </IconButton>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Facebook', 'Twitter', 'WhatsApp', 'Email', 'Pinterest', 'Copy Link'].map(platform => (
              <Button 
                key={platform}
                variant="outlined"
                className="h-16"
                onClick={() => handleShareRecipe(platform)}
              >
                {platform}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Nutrition Dialog */}
      <Dialog
        open={showNutritionDialog}
        onClose={() => setShowNutritionDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Nutrition Information</Typography>
            <IconButton onClick={() => setShowNutritionDialog(false)}>
              <Close />
            </IconButton>
          </div>
          <Typography variant="subtitle2" className="mb-3 text-gray-500">
            Per serving
          </Typography>
          <div className="space-y-3">
            {Object.entries(nutritionInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b pb-2">
                <Typography variant="body1" className="capitalize">
                  {key}
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {value}
                </Typography>
              </div>
            ))}
          </div>
          <Typography variant="caption" className="block mt-4 text-gray-500">
            * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
          </Typography>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default RecipeDetails;