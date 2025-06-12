import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Button,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import UserDashboardLayout from '../../../Layout/UserDashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import RecipeCard from '../../../components/RecipeCard';
import { toast } from 'react-toastify';
import { RecipeData } from '../../../types/Recipe';

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/api/recipes/`,
};

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [likeCount, setLikeCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recipesRes] = await Promise.all([
          axios.get(API_ENDPOINTS.recipes, { withCredentials: true }),
        ]);
        setRecipes(recipesRes.data.results || recipesRes.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Like and favorite handlers for dashboard
  const handleToggleLike = async (id: number | undefined) => {
    if (!id) return;
    setRecipes(prev => prev.map(recipe =>
      recipe.id === id
        ? {
            ...recipe,
            isLiked: !recipe.isLiked,
            likeCount: recipe.isLiked ? recipe.likeCount - 1 : recipe.likeCount + 1,
          }
        : recipe
    ));
    try {
      await axios.post(`${API_BASE_URL}/api/recipes/${id}/like/`, {}, { withCredentials: true });
      toast.success('Recipe like updated!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update like');
      }
    }
  };

  const handleToggleFavorite = async (id: number | undefined) => {
    if (!id) return;
    setRecipes(prev => prev.map(recipe =>
      recipe.id === id
        ? { ...recipe, isSaved: !recipe.isSaved }
        : recipe
    ));
    try {
      await axios.post(`${API_BASE_URL}/api/recipes/${id}/favorite/`, {}, { withCredentials: true });
      toast.success('Recipe saved to favorites!');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update favorite');
      }
    }
  };

  // Helper to get category name as string
  function getCategoryName(category: unknown): string {
    if (typeof category === 'string') return category;
    if (
      category &&
      typeof category === 'object' &&
      'name' in category &&
      typeof (category as { name: unknown }).name === 'string'
    ) {
      return (category as { name: string }).name;
    }
    return '';
  }

  return (
    <UserDashboardLayout title="User Dashboard">
      <Grid container spacing={3}>
        {/* Welcome section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right, #d97706, #f59e0b)',
              color: 'white',
            }}
          >
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.username || 'Food Enthusiast'}!
            </Typography>
            <Typography variant="body1">
              Explore new recipes, save your favorites, and share your cooking adventures.
            </Typography>
          </Paper>
        </Grid>

        {/* Search bar */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for recipes, ingredients, or chefs..."
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Grid>

        {/* Tabs for different recipe categories */}
        <Grid item xs={12}>
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root.Mui-selected': {
                  color: '#d97706',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#d97706',
                },
              }}
            >
              <Tab label="For You" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Popular" icon={<StarIcon />} iconPosition="start" />
              <Tab label="Recent" icon={<ScheduleIcon />} iconPosition="start" />
            </Tabs>

            <Divider />

            <Box sx={{ p: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#d97706' }} />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                      <RecipeCard
                        recipe={{
                          id: recipe.id,
                          title: recipe.title,
                          category: getCategoryName(recipe.category),
                          imageUrl: recipe.image,
                          cookTime: recipe.preparation_time + recipe.cooking_time,
                          difficulty: '', // Map if available
                          rating: recipe.average_rating,
                          reviewCount: 0, // Map if available
                          author: {
                            name: recipe.author.username,
                            avatarUrl: '', // Map if available
                          },
                          isSaved: false,
                          isLiked: false,
                          likeCount: 0,
                        }}
                        dashboardType="user"
                        // Remove onEdit/onDelete for user dashboard
                        isFavorited={recipe.is_favorited}
                        onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                        onToggleLike={() => handleToggleLike(recipe.id)}
                        isLiked={recipe.is_liked}
                      />
                      {/* Optionally show category below card */}
                      {/* <Typography variant="caption" color="text.secondary">{getCategoryName(recipe.category)}</Typography> */}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Navigation buttons for Shop and Orders */}
        {/* <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" color="primary" href="/shop" sx={{ borderRadius: 2 }}>
              Go to Shop
            </Button>
            <Button variant="outlined" color="primary" href="/dashboard/user/orders" sx={{ borderRadius: 2 }}>
              My Orders
            </Button>
          </Box>
        </Grid> */}
      </Grid>
    </UserDashboardLayout>
  );
};

export default UserDashboardPage;