import React, { useState, useEffect } from 'react';
import { 
  Typography,  
  TextField, 
  InputAdornment,
  Button,
  Box,
  Drawer,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  useMediaQuery,
  useTheme,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { RecipeData } from '../../types/Recipe';
import RecipeCard from '../../components/RecipeCard';
import { Recipe } from '../../types/Recipe';
import { RecipeForm } from '../../components/RecipeForm';
import UserDashboardLayout from '../../Layout/UserDashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/api/recipes/`,
  categories: `${API_BASE_URL}/api/categories/`,
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
  likeCount: number;
  is_favorited: boolean;
  is_liked: boolean;
  created_at: string;
  slug: string;
}

// Filter state interface
interface FilterState {
  category: string;
  difficulty: string;
  cookTime: string;
  rating: string;
}

const difficulties = ["Easy", "Medium", "Hard", "Expert"];
const cookTimeRanges = [
  { label: "< 15 min", min: 0, max: 14 },
  { label: "15-30 min", min: 15, max: 30 },
  { label: "30-60 min", min: 31, max: 60 },
  { label: "> 60 min", min: 61, max: 999 }
];
const ratingOptions = ["4+ Stars", "3+ Stars", "2+ Stars", "1+ Stars"];

const RecipesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openRecipeForm, setOpenRecipeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    cookTime: '',
    rating: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.categories, { withCredentials: true });
        console.log('Categories response:', res.data);
        setCategories(res.data.results || res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        toast.error('Failed to fetch categories');
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_ENDPOINTS.recipes, { withCredentials: true });
        console.log('Fetched recipes:', res.data);
        const recipesData = res.data.results || res.data;
        setRecipes(recipesData);
        setFilteredRecipes(recipesData);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setError('Failed to fetch recipes. Please try again.');
        toast.error('Failed to fetch recipes');
        setRecipes([]);
        setFilteredRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Toggle favorite functionality
  const handleToggleFavorite = async (recipeId: number) => {
    try {
      await axios.post(
        API_ENDPOINTS.toggleFavorite(recipeId), 
        {}, 
        { withCredentials: true }
      );
      
      // Update local state
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, is_favorited: !recipe.is_favorited }
          : recipe
      );
      setRecipes(updatedRecipes);
      
      // Also update filtered recipes
      const updatedFilteredRecipes = filteredRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, is_favorited: !recipe.is_favorited }
          : recipe
      );
      setFilteredRecipes(updatedFilteredRecipes);
      
      toast.success('Recipe updated in favorites!');
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      toast.error('Failed to update favorite');
    }
  };

  // Filter and search logic
  useEffect(() => {
    const applyFilters = () => {
      let filtered = recipes.filter(recipe => {
        // Search term filter
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter
        const matchesCategory = !filters.category || recipe.category.name === filters.category;
        
        // Difficulty filter
        const matchesDifficulty = !filters.difficulty || recipe.difficulty === filters.difficulty;
        
        // Cook time filter
        let matchesCookTime = true;
        if (filters.cookTime) {
          const selectedRange = cookTimeRanges.find(range => range.label === filters.cookTime);
          if (selectedRange) {
            const totalTime = recipe.prepTime + recipe.cookTime;
            matchesCookTime = totalTime >= selectedRange.min && totalTime <= selectedRange.max;
          }
        }
        
        // Rating filter
        let matchesRating = true;
        if (filters.rating && recipe.average_rating) {
          const rating = parseFloat(recipe.average_rating);
          switch (filters.rating) {
            case "4+ Stars":
              matchesRating = rating >= 4;
              break;
            case "3+ Stars":
              matchesRating = rating >= 3;
              break;
            case "2+ Stars":
              matchesRating = rating >= 2;
              break;
            case "1+ Stars":
              matchesRating = rating >= 1;
              break;
          }
        }
        
        return matchesSearch && matchesCategory && matchesDifficulty && matchesCookTime && matchesRating;
      });
      
      setFilteredRecipes(filtered);
    };

    // Debounce the filter application
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, recipes]);

  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      cookTime: '',
      rating: ''
    });
    setSearchTerm('');
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  // Convert API recipe to RecipeData format for RecipeCard
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={isLargeScreen ? 4 : 6} lg={4} xl={3} key={index}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
            <Skeleton variant="text" sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Filter panel content
  const filterPanel = (
    <Box sx={{ p: 3, width: isMobile ? '100%' : 320 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
        <Box>
          {activeFilterCount > 0 && (
            <Chip 
              label={`${activeFilterCount} active`}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
          )}
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Category filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value as string)}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Difficulty filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="difficulty-label">Difficulty</InputLabel>
        <Select
          labelId="difficulty-label"
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value as string)}
          label="Difficulty"
        >
          <MenuItem value="">Any Difficulty</MenuItem>
          {difficulties.map((difficulty) => (
            <MenuItem key={difficulty} value={difficulty}>
              {difficulty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Cook Time filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="cook-time-label">Total Time</InputLabel>
        <Select
          labelId="cook-time-label"
          value={filters.cookTime}
          onChange={(e) => handleFilterChange('cookTime', e.target.value as string)}
          label="Total Time"
        >
          <MenuItem value="">Any Time</MenuItem>
          {cookTimeRanges.map((range) => (
            <MenuItem key={range.label} value={range.label}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Rating filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="rating-label">Rating</InputLabel>
        <Select
          labelId="rating-label"
          value={filters.rating}
          onChange={(e) => handleFilterChange('rating', e.target.value as string)}
          label="Rating"
        >
          <MenuItem value="">Any Rating</MenuItem>
          {ratingOptions.map((rating) => (
            <MenuItem key={rating} value={rating}>
              {rating}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={clearFilters}
        disabled={activeFilterCount === 0}
        sx={{ 
          mt: 2,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        Clear All Filters
      </Button>
    </Box>
  );

  // Toggle like functionality
  async function handleToggleLike(id: number | undefined): Promise<void> {
    if (!id) return;
    try {
      // You may need to implement a like API endpoint similar to favorite
      const response = await axios.post(
        `${API_BASE_URL}/api/recipes/${id}/like/`,
        {},
        { withCredentials: true }
      );

      // Update local state for recipes
      const updatedRecipes = recipes.map(recipe =>
        recipe.id === id
          ? {
              ...recipe,
              is_liked: !recipe.is_liked,
              likesCount: recipe.is_liked
                ? recipe.likesCount - 1
                : recipe.likesCount + 1,
            }
          : recipe
      );
      setRecipes(updatedRecipes);

      // Update local state for filtered recipes
      const updatedFilteredRecipes = filteredRecipes.map(recipe =>
        recipe.id === id
          ? {
              ...recipe,
              is_liked: !recipe.is_liked,
              likesCount: recipe.is_liked
                ? recipe.likesCount - 1
                : recipe.likesCount + 1,
            }
          : recipe
      );
      setFilteredRecipes(updatedFilteredRecipes);

      toast.success('Recipe like updated!');
    } catch (err) {
      console.error('Failed to toggle like:', err);
      toast.error('Failed to update like');
    }
  }

  return (
    <UserDashboardLayout title="All Recipes">
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          mb: { xs: 2, md: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1
              }}
            >
              Discover Recipes
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
            >
              {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
              {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`}
            </Typography>
          </Box>
          
          {/* Quick stats */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Chip 
              icon={<FavoriteIcon />}
              label={`${recipes.filter(r => r.is_favorited).length} Favorites`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>
        
        {/* Search and filter bar */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            mb: 3
          }}
        >
          {/* Search field */}
          <Box sx={{ flexGrow: 1, maxWidth: { xs: '100%', md: '50%' } }}>
            <TextField
              variant="outlined"
              placeholder="Search recipes by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              sx={{
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
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', md: 'auto' }
          }}>
            {/* Filter button for mobile/tablet */}
            {!isLargeScreen && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setDrawerOpen(true)}
                sx={{ 
                  borderRadius: 3,
                  minWidth: { xs: '100%', sm: 120 },
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Filters
                {activeFilterCount > 0 && (
                  <Chip 
                    label={activeFilterCount} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </Button>
            )}
          </Box>
        </Box>
        
        {/* Active filter chips for mobile/tablet */}
        {!isLargeScreen && activeFilterCount > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {searchTerm && (
              <Chip 
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.category && (
              <Chip 
                label={`Category: ${filters.category}`} 
                onDelete={() => handleFilterChange('category', '')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.difficulty && (
              <Chip 
                label={`Difficulty: ${filters.difficulty}`} 
                onDelete={() => handleFilterChange('difficulty', '')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.cookTime && (
              <Chip 
                label={`Time: ${filters.cookTime}`} 
                onDelete={() => handleFilterChange('cookTime', '')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.rating && (
              <Chip 
                label={`Rating: ${filters.rating}`} 
                onDelete={() => handleFilterChange('rating', '')}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Main content area with filter sidebar and recipe grid */}
      <Box sx={{ display: 'flex' }}>
        {/* Filter sidebar for large screens */}
        {isLargeScreen && (
          <Box 
            component={Paper} 
            elevation={2} 
            sx={{ 
              width: 320, 
              mr: 4, 
              height: 'fit-content',
              position: 'sticky',
              top: 24,
              borderRadius: 3,
              display: { xs: 'none', lg: 'block' },
              backgroundColor: 'background.paper'
            }}
          >
            {filterPanel}
          </Box>
        )}
        
        {/* Recipe grid */}
        <Box sx={{ flexGrow: 1 }}>
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredRecipes.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8,
                textAlign: 'center'
              }}
            >
              <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No recipes found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search terms or filters
              </Typography>
              {activeFilterCount > 0 && (
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  sx={{ borderRadius: 2 }}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={isLargeScreen ? 4 : 6} lg={4} xl={3} key={recipe.id}>
                  <RecipeCard
                    recipe={convertToRecipeData(recipe)}
                    isFavorited={recipe.isFavorited}
                    isLiked={recipe.isLiked}
                    onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                    onToggleLike={() => handleToggleLike(recipe.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
      
      {/* Filter drawer for mobile/tablet */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 320,
            borderTopLeftRadius: isMobile ? 0 : 16,
            borderBottomLeftRadius: isMobile ? 0 : 16,
          }
        }}
      >
        {filterPanel}
      </Drawer>
      
      {/* Recipe Form Modal */}
      <RecipeForm
        open={openRecipeForm}
        onClose={() => setOpenRecipeForm(false)}
        onSave={(recipe) => {
          console.log('New recipe created:', recipe);
          // Refresh recipes after adding new one
          // You might want to refetch recipes here
        }}
      />
    </UserDashboardLayout>
  );
};

export default RecipesPage;