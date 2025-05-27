import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Bookmark as BookmarkIcon, 
  Restaurant as RestaurantIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import UserDashboardLayout from '../../../Layout/UserDashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

// Define recipe type
interface Recipe {
  id: number;
  title: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  rating: number;
  author: {
    username: string;
    is_chef: boolean;
  };
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navItems = [
    { icon: <DashboardIcon />, text: 'Dashboard', path: '/user-dashboard' },
    { icon: <RestaurantIcon />, text: 'Recipes', path: '/recipes' },
    { icon: <BookmarkIcon />, text: 'Saved', path: '/saved-recipes' },
    { icon: <FavoriteIcon />, text: 'Favorites', path: '/favorite-recipes' },
  ];

  // Sample recipe data - in a real app, this would come from your API
  const sampleRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Pasta Carbonara',
      image_url: '/api/placeholder/300/200',
      prep_time: 10,
      cook_time: 15,
      rating: 4.8,
      author: {
        username: 'chef_mario',
        is_chef: true
      }
    },
    {
      id: 2,
      title: 'Avocado Toast',
      image_url: '/api/placeholder/300/200',
      prep_time: 5,
      cook_time: 5,
      rating: 4.5,
      author: {
        username: 'food_lover',
        is_chef: false
      }
    },
    {
      id: 3,
      title: 'Chicken Stir Fry',
      image_url: '/api/placeholder/300/200',
      prep_time: 15,
      cook_time: 10,
      rating: 4.6,
      author: {
        username: 'chef_sarah',
        is_chef: true
      }
    },
    {
      id: 4,
      title: 'Chocolate Brownies',
      image_url: '/api/placeholder/300/200',
      prep_time: 15,
      cook_time: 25,
      rating: 4.9,
      author: {
        username: 'dessert_master',
        is_chef: false
      }
    }
  ];

  useEffect(() => {
    // In a real app, you would fetch data from your API
    // For now, we'll simulate an API call with a timeout
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app: const response = await axios.get('your-api-endpoint');
        // For demo purposes:
        setTimeout(() => {
          setRecipes(sampleRecipes);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={recipe.image_url}
        alt={recipe.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {recipe.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            By {recipe.author.username}
          </Typography>
          {recipe.author.is_chef && (
            <Chip 
              label="Chef" 
              size="small" 
              color="primary" 
              sx={{ ml: 1, bgcolor: '#d97706' }} 
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {recipe.prep_time + recipe.cook_time} min
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon fontSize="small" sx={{ color: '#f59e0b' }} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              {recipe.rating}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          variant="contained" 
          fullWidth
          sx={{ backgroundColor: '#d97706', '&:hover': { backgroundColor: '#b45309' } }}
        >
          View Recipe
        </Button>
      </Box>
    </Card>
  );

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
                      <RecipeCard recipe={recipe} />
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

export default UserDashboard;