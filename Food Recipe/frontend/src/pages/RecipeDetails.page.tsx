/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
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
  Chip,
  Collapse
} from '@mui/material';
import { 
  AccessTime, 
  LocalDining, 
  Share, 
  PictureAsPdf,  
  Message, 
  Print,
  Star,
  FavoriteBorder,
  Favorite,
  RestaurantMenu,
  ShoppingBasket,
  Info,
  Close,
  Restaurant,
  Reply,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import TitleText from '../components/TitleText';
import axios from 'axios';
import { Timer } from '../components/TimerComponent';
import { toast } from 'react-toastify';
import { Recipe } from '../types/Recipe';
import RecipeLayoutWrapper from '../components/RecipeLayoutWrapper';
import { 
  generateRecipePDF, 
  shareRecipe, 
  printRecipe, 
  formatDate, 
  toggleRecipeFavorite,
  getUserInfo 
} from '../utils/recipeHelpers';

interface ReviewReply {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  date: string;
  content: string;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  date: string;
  rating: number;
  content: string;
  replies: ReviewReply[];
}

interface RelatedRecipe {
  id: string;
  title: string;
  image: string;
  cookingTime: number;
  rating: number;
}

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipeDetail: (id: string) => `${API_BASE_URL}/api/recipes/${id}/`,
  relatedRecipes: (categoryId: string) => `${API_BASE_URL}/api/recipes/?category=${categoryId}`,
  recipeReviews: (id: string) => `${API_BASE_URL}/api/recipes/${id}/review/`,
};

const RecipeDetails: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedRecipes, setRelatedRecipes] = useState<RelatedRecipe[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [username, setUsername] = useState('');
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState<number | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [ratingPercentages, setRatingPercentages] = useState<{ [key: number]: number }>({});
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showNutritionDialog, setShowNutritionDialog] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<{[key: string]: boolean}>({});
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [showReplyForm, setShowReplyForm] = useState<{[key: string]: boolean}>({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Get user info for authentication-aware features
  const { isAuthenticated, userId, userData } = getUserInfo();

  const fetchRecipe = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.recipeDetail(recipeId!));
      const data = res.data;

      setRecipe({
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image || '/api/placeholder/400/300',
        preparationTime: data.preparation_time,
        cookingTime: data.cooking_time,
        servings: data.servings,
        difficulty: data.difficulty,
        calories: data.calories,
        rating: Number(data.average_rating) || 0,
        ratingCount: data.rating_count || 0,
        author: {
          id: data.author?.id,
          name: data.author?.username || data.author?.name || 'Chef',
          avatar: data.author?.profile_picture || '/api/placeholder/50/50',
        },
        ingredients: (data.ingredients || []).map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
          checked: false,
        })),
        steps: (data.steps || []).map((step: any) => ({
          id: step.id,
          description: step.description,
          image: step.image,
        })),
        tips: (data.tips || []).map((tip: any) => tip.description || tip.tip || ''),
        isFavorite: data.is_favorited || false,
        category: data.category?.name || data.category || '',
        tags: (data.tags || []).map((tag: any) => tag.name || tag),
      });

      if (data.category?.id) {
        const relatedRes = await axios.get(API_BASE_URL + `/api/recipes/?category=${data.category.id}`);
        setRelatedRecipes(
          (relatedRes.data.results || relatedRes.data)
            .filter((r: any) => r.id !== data.id)
            .slice(0, 4)
            .map((r: any) => ({
              id: r.id,
              title: r.title,
              image: r.image || '/api/placeholder/400/300',
              cookingTime: r.cooking_time || 0,
              rating: Number(r.average_rating) || 0,
            }))
        );
      } else {
        setRelatedRecipes([]);
      }
    } catch (error: any) {
      console.log('Error fetching recipe details:', error);
      navigate('/not-found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.recipeReviews(recipeId!));
      setAllReviews(
        (res.data.results || []).map((item: any, idx: number) => ({
          id: item.id || `review-${idx}`,
          user: {
            name: item.username || item.user?.name || 'Anonymous',
            avatar: item.user?.avatar || '/api/placeholder/400/300'
          },
          date: formatDate(item.created_at),
          rating: Number(item.rating || item.value),
          content: item.review || item.text,
          replies: []
        }))
      );
      setRatingPercentages(res.data.rating_percentages || {});
    } catch (err) {
      setAllReviews([]);
      setRatingPercentages({});
    }
  };

  useEffect(() => {
    fetchRecipe();
    fetchReviews();
  }, [recipeId, navigate]);

  // Set default username from user data if authenticated
  useEffect(() => {
    if (isAuthenticated && userData && !username) {
      setUsername(userData.username || userData.name || '');
    }
  }, [isAuthenticated, userData, username]);

  const toggleIngredientCheck = (id: string) => {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map(ing => 
        ing.id === id ? { ...ing, checked: !ing.checked } : ing
      )
    });
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    
    if (!isAuthenticated) {
      toast.info('Please log in to save recipes to favorites');
      return;
    }

    const newFavoriteStatus = await toggleRecipeFavorite(
      recipe.id, 
      recipe.isFavorite, 
      userId || undefined
    );
    
    setRecipe({
      ...recipe,
      isFavorite: newFavoriteStatus
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !userRating || !newComment || submittingReview) return;

    setSubmittingReview(true);
    try {
      const response = await axios.post(API_ENDPOINTS.recipeReviews(recipeId!), {
        username,
        rating: userRating,
        review: newComment,
      });

      if (response.status === 201) {
        const newReview: Review = {
          id: `temp-${Date.now()}`,
          user: {
            name: username,
            avatar: '/api/placeholder/400/300'
          },
          date: 'Just now',
          rating: userRating,
          content: newComment,
          replies: []
        };

        setAllReviews(prev => [newReview, ...prev]);
        
        if (recipe) {
          setRecipe({
            ...recipe,
            ratingCount: recipe.ratingCount + 1,
            rating: ((recipe.rating * recipe.ratingCount) + userRating) / (recipe.ratingCount + 1)
          });
        }

        setUserRating(null);
        setUsername('');
        setNewComment('');
        toast.success('Review submitted successfully!');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    const replyText = replyTexts[reviewId];
    if (!replyText || !username) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/recipes/${recipeId}/comments/${reviewId}/reply/`,
        {
          username,
          text: replyText,
        }
      );

      if (response.status === 201) {
        const reply = response.data.reply;
        setAllReviews(prev =>
          prev.map(review =>
            review.id === reviewId
              ? { ...review, replies: [...review.replies, reply] }
              : review
          )
        );
        toast.success('Reply added!');
      }
    } catch (err) {
      toast.error('Failed to add reply.');
    } finally {
      setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
      setShowReplyForm(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const toggleReplies = (reviewId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const toggleReplyForm = (reviewId: string) => {
    setShowReplyForm(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleShareRecipe = async (platform: string) => {
    if (!recipe) return;
    
    try {
      await shareRecipe(platform, recipe, userId || undefined);
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const handlePrintRecipe = () => {
    printRecipe();
  };

  const handleDownloadPdf = async () => {
    if (!recipe || pdfGenerating) return;
    
    setPdfGenerating(true);
    try {
      await generateRecipePDF(recipe);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Nutrition data (static for now)
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
                onClick={handleToggleFavorite}
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
                className="w-16 h-16 cursor-pointer"
                onClick={() => navigate(`/user/${recipe.author.id}`)}
              />
              <div className="flex-1">
                <Typography variant="subtitle1" className="font-medium">
                  Recipe by {recipe.author.name}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  Professional Chef
                </Typography>
              </div>
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
                  
                  <ul className="space-y-4">
                    {recipe.ingredients.map((ingredient) => (
                      <motion.li 
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={ingredient.checked}
                          onChange={() => toggleIngredientCheck(ingredient.id)}
                          className="text-amber-500"
                        />
                        <Typography 
                          variant="body1"
                          className={ingredient.checked ? 'line-through text-gray-500' : ''}
                        >
                          {ingredient.amount} {ingredient.name}
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
                  <div className="flex justify-between items-center mb-6">
                    <TitleText title={`Reviews (${allReviews.length})`}/>
                  </div>

                  <div className="flex-1 pl-6 border-l">
                        <div className="space-y-1">
                          {[5, 4, 3, 2, 1].map(stars => {
                            const percentage = ratingPercentages[stars] || 0;
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
        
                  {/* Write Review Form */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <Typography variant="h6" className="mb-4">Write a Review</Typography>
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <TextField
                        fullWidth
                        label="Your Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        variant="outlined"
                      />
                      
                      <div>
                        <Typography component="legend" className="mb-2">Rating</Typography>
                        <Rating
                          value={userRating}
                          onChange={(event, newValue) => setUserRating(newValue)}
                          size="large"
                          className="text-amber-500"
                        />
                      </div>
                      
                      <TextField
                        fullWidth
                        label="Your Review"
                        multiline
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        variant="outlined"
                      />
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={!username || !userRating || !newComment || submittingReview}
                        startIcon={submittingReview ? <CircularProgress size={20} /> : <Message />}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  </div>
                  
                  {/* Reviews List */}
                  <div className="space-y-6">
                    {allReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <Message className="text-gray-400 mb-4" style={{ fontSize: 48 }} />
                        <Typography variant="h6" className="text-gray-500 mb-2">
                          No reviews yet
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                          Be the first to share your thoughts about this recipe!
                        </Typography>
                      </div>
                    ) : (
                      allReviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                        >
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={review.user.avatar} alt={review.user.name} />
                              <div>
                                <Typography variant="subtitle1" className="font-medium">
                                  {review.user.name}
                                </Typography>
                                <div className="flex items-center gap-2">
                                  <Rating value={review.rating} readOnly size="small" className="text-amber-400" />
                                  <Typography variant="caption" className="text-gray-500">
                                    {review.date}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Review Content */}
                          <Typography variant="body1" className="mb-4">
                            {review.content}
                          </Typography>
                          
                          {/* Review Actions */}
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                            <Button
                              size="small"
                              startIcon={<Reply />}
                              onClick={() => toggleReplyForm(review.id)}
                              className="text-gray-600"
                            >
                              Reply
                            </Button>
                            
                            {review.replies.length > 0 && (
                              <Button
                                size="small"
                                startIcon={expandedReplies[review.id] ? <ExpandLess /> : <ExpandMore />}
                                onClick={() => toggleReplies(review.id)}
                                className="text-gray-600"
                              >
                                {expandedReplies[review.id] ? 'Hide' : 'Show'} {review.replies.length} {review.replies.length === 1 ? 'Reply' : 'Replies'}
                              </Button>
                            )}
                          </div>
                          
                          {/* Reply Form */}
                          <Collapse in={showReplyForm[review.id]}>
                            <div className="mt-4 pl-4 border-l-2 border-gray-200">
                              <div className="flex gap-3">
                                <Avatar sx={{ width: 32, height: 32 }} />
                                <div className="flex-1">
                                  <TextField
                                    fullWidth
                                    placeholder="Write a reply..."
                                    multiline
                                    rows={2}
                                    value={replyTexts[review.id] || ''}
                                    onChange={(e) => setReplyTexts(prev => ({
                                      ...prev,
                                      [review.id]: e.target.value
                                    }))}
                                    variant="outlined"
                                    size="small"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleReplySubmit(review.id)}
                                      disabled={!replyTexts[review.id] || !username}
                                      className="bg-amber-500 hover:bg-amber-600"
                                    >
                                      Reply
                                    </Button>
                                    <Button
                                      size="small"
                                      onClick={() => toggleReplyForm(review.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                          
                          {/* Replies */}
                          <Collapse in={expandedReplies[review.id]}>
                            <div className="mt-4 space-y-4">
                              {review.replies.map((reply) => (
                                <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                                  <div className="flex items-start gap-3">
                                    <Avatar src={reply.user.avatar} alt={reply.user.name} sx={{ width: 32, height: 32 }} />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Typography variant="subtitle2" className="font-medium">
                                          {reply.user.name}
                                        </Typography>
                                        <Typography variant="caption" className="text-gray-500">
                                          {reply.date}
                                        </Typography>
                                      </div>
                                      <Typography variant="body2">
                                        {reply.content}
                                      </Typography>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Collapse>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </Box>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Recipe Timer */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <TitleText title="Recipe Timer"/>
              <Timer 
                minutes={recipe.preparationTime + recipe.cookingTime}
              />
            </div>
            
            {/* Related Recipes */}
            {/* {relatedRecipes.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <TitleText title="You Might Also Like"/>
                <div className="space-y-4">
                  {relatedRecipes.map((relatedRecipe) => (
                    <motion.div
                      key={relatedRecipe.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/recipe/${relatedRecipe.id}`)}
                    >
                      <img 
                        src={relatedRecipe.image}
                        alt={relatedRecipe.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Typography variant="subtitle2" className="font-medium mb-1">
                          {relatedRecipe.title}
                        </Typography>
                        <div className="flex items-center gap-2">
                          <AccessTime className="text-gray-400" style={{ fontSize: 16 }} />
                          <Typography variant="caption" className="text-gray-600">
                            {relatedRecipe.cookingTime} min
                          </Typography>
                          <Rating value={relatedRecipe.rating} readOnly size="small" className="text-amber-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onClose={() => setShowShareDialog(false)}>
        <DialogContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Share Recipe</Typography>
            <IconButton onClick={() => setShowShareDialog(false)}>
              <Close />
            </IconButton>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {['Facebook', 'Twitter', 'WhatsApp', 'Pinterest', 'Email', 'Copy Link'].map((platform) => (
              <Button
                key={platform}
                variant="outlined"
                onClick={() => handleShareRecipe(platform)}
                className="p-3"
              >
                {platform}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Nutrition Dialog */}
      <Dialog open={showNutritionDialog} onClose={() => setShowNutritionDialog(false)}>
        <DialogContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Nutrition Information</Typography>
            <IconButton onClick={() => setShowNutritionDialog(false)}>
              <Close />
            </IconButton>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.calories}</Typography>
              <Typography variant="caption">Calories</Typography>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.protein}</Typography>
              <Typography variant="caption">Protein</Typography>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.carbs}</Typography>
              <Typography variant="caption">Carbs</Typography>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.fat}</Typography>
              <Typography variant="caption">Fat</Typography>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.sugar}</Typography>
              <Typography variant="caption">Sugar</Typography>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Typography variant="h6">{nutritionInfo.fiber}</Typography>
              <Typography variant="caption">Fiber</Typography>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default RecipeDetails;