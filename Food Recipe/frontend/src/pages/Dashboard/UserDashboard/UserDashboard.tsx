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

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/api/recipes/`,
};

const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.recipes, { withCredentials: true });
        setRecipes(response.data.results || response.data);
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
                          category: '', // You can map this if you have category info
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
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </UserDashboardLayout>
  );
};

export default UserDashboardPage;