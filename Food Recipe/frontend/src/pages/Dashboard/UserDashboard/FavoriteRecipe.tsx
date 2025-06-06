import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  FavoriteOutlined as FavoriteOutlinedIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import RecipeCard from '../../../components/RecipeCard';
import { RecipeData } from '../../../types/Recipe';
import UserDashboardLayout from '../../../Layout/UserDashboardLayout';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  favorites: `${API_BASE_URL}/api/my-favorites/`,
  toggleFavorite: (recipeId: number) => `${API_BASE_URL}/api/recipes/${recipeId}/favorite/`,
};

// Enhanced Recipe Interface to match API response
interface APIRecipe {
  id: number;
  title: string;
  description: string;
  image: string;
  video?: string;
  author: {
    id: number;
    username: string;
    email: string;
    profile_image?: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
    description: string;
  };
  difficulty: string;
  preparation_time: number;
  cooking_time: number;
  servings: number;
  calories?: number;
  average_rating?: string | null;
  rating_count: number;
  like_count: number;
  is_favorited: boolean;
  is_liked: boolean;
  created_at: string;
  slug: string;
}

// Convert API recipe to RecipeData format
const convertToRecipeData = (apiRecipe: APIRecipe): RecipeData => ({
  id: apiRecipe.id,
  title: apiRecipe.title,
  description: apiRecipe.description,
  image: apiRecipe.image,
  category: apiRecipe.category.name,
  difficulty: apiRecipe.difficulty,
  cookTime: apiRecipe.preparation_time + apiRecipe.cooking_time,
  servings: apiRecipe.servings,
  rating: apiRecipe.average_rating ? parseFloat(apiRecipe.average_rating) : 0,
  author: {
    name: apiRecipe.author.username,
    avatarUrl: apiRecipe.author.profile_image || '',
    id: apiRecipe.author.id,
  },
  createdAt: apiRecipe.created_at,
  ingredients: [],
  instructions: [],
  tags: [],
  calories: apiRecipe.calories || 0,
  prepTime: apiRecipe.preparation_time,
  isFavorited: apiRecipe.is_favorited,
  isLiked: apiRecipe.is_liked,
  likeCount: apiRecipe.like_count, // <-- use likeCount, not likesCount
  ratingsCount: apiRecipe.rating_count,
  reviewCount: apiRecipe.rating_count,
});

const FavoriteRecipe: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [favorites, setFavorites] = useState<APIRecipe[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<APIRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites from API
  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_ENDPOINTS.favorites, { withCredentials: true });
      console.log('Fetched favorites:', res.data);
      const favoritesData = res.data.results || res.data;
      setFavorites(favoritesData);
      setFilteredFavorites(favoritesData);
    } catch (err) {
      console.error('Failed to fetch favorite recipes:', err);
      setError('Failed to fetch favorite recipes. Please try again.');
      toast.error('Failed to fetch favorite recipes');
      setFavorites([]);
      setFilteredFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Filter favorites based on search term
  useEffect(() => {
    const filtered = favorites.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFavorites(filtered);
  }, [searchTerm, favorites]);

  // Toggle favorite handler
  const handleToggleFavorite = async (recipeId: number) => {
    try {
      await axios.post(
        API_ENDPOINTS.toggleFavorite(recipeId), 
        {}, 
        { withCredentials: true }
      );
      
      // Remove from favorites list since it's no longer favorited
      const updatedFavorites = favorites.filter(recipe => recipe.id !== recipeId);
      setFavorites(updatedFavorites);
      setFilteredFavorites(updatedFavorites.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      toast.success('Recipe removed from favorites!');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite');
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Statistics calculation
  const totalFavorites = favorites.length;
  const categoryCounts = favorites.reduce((acc, recipe) => {
    acc[recipe.category.name] = (acc[recipe.category.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const averageRating = favorites.length > 0 
    ? favorites
        .filter(recipe => recipe.average_rating)
        .reduce((sum, recipe) => sum + parseFloat(recipe.average_rating!), 0) / 
      favorites.filter(recipe => recipe.average_rating).length
    : 0;

  return (
    <UserDashboardLayout title="My Favorite Recipes">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <FavoriteOutlinedIcon 
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' }, 
                  color: 'error.main' 
                }} 
              />
              My Favorite Recipes
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}
            >
              {totalFavorites} recipe{totalFavorites !== 1 ? 's' : ''} saved for later
              {searchTerm && ` • ${filteredFavorites.length} matching search`}
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        {totalFavorites > 0 && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.100'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FavoriteOutlinedIcon color="primary" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalFavorites}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Favorites
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.100'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantIcon color="success" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Object.keys(categoryCounts).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categories
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: 'warning.50',
                border: '1px solid',
                borderColor: 'warning.100'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="warning" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: 'info.50',
                border: '1px solid',
                borderColor: 'info.100'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="info" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Math.round(
                        favorites.reduce((sum, recipe) => 
                          sum + recipe.preparation_time + recipe.cooking_time, 0
                        ) / totalFavorites || 0
                      )}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Cook Time
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Top Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {topCategories.map(([category, count]) => (
                <Chip
                  key={category}
                  label={`${category} (${count})`}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Search Bar */}
        {totalFavorites > 0 && (
          <Box sx={{ mb: 3 }}>
            <TextField
              variant="outlined"
              placeholder="Search your favorite recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              sx={{
                maxWidth: 500,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : totalFavorites === 0 ? (
        <Fade in={!loading}>
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <FavoriteOutlinedIcon 
              sx={{ 
                fontSize: 80, 
                color: 'text.disabled', 
                mb: 3 
              }} 
            />
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ mb: 2, fontWeight: 600 }}
            >
              No favorite recipes yet
            </Typography>
            <Typography 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
            >
              Start exploring recipes and click the heart icon to save your favorites here. 
              They'll be easily accessible whenever you need them!
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => window.location.href = '/dashboard/user/recipes'}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Browse Recipes
            </Button>
          </Paper>
        </Fade>
      ) : filteredFavorites.length === 0 ? (
        <Fade in={!loading}>
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              bgcolor: 'background.paper'
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No recipes match your search
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try different keywords or clear your search
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setSearchTerm('')}
              sx={{ borderRadius: 2 }}
            >
              Clear Search
            </Button>
          </Paper>
        </Fade>
      ) : (
        <Fade in={!loading}>
          <Grid container spacing={3}>
            {filteredFavorites.map((recipe, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <Fade in={!loading} timeout={300 + index * 100}>
                  <div>
                    <RecipeCard
                      recipe={convertToRecipeData(recipe)}
                      onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                      showFavoriteButton={true}
                      dashboardMode={false}
                    />
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* Quick Actions */}
      {totalFavorites > 0 && (
        <Box sx={{ 
          mt: 6, 
          pt: 4, 
          borderTop: 1, 
          borderColor: 'divider',
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/dashboard/user/recipes'}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Browse More Recipes
            </Button>
            <Button 
              variant="outlined" 
              onClick={fetchFavorites}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Refresh Favorites
            </Button>
          </Box>
        </Box>
      )}
    </UserDashboardLayout>
  );
};

export default FavoriteRecipe;