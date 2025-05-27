import React, { useState, useEffect } from 'react';
import { 
  Typography,  
  TextField, 
  InputAdornment,
  Button,
  Container,
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
  Paper
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { RecipeData } from '../../types/Recipe';
import { 
  spaghetti,
  ekwang,
  katikati,
  pizza,
  ndole,
  achu,
  oslun,
  pepperBeef
} from "../../components/images";
import RecipeCard from '../../components/RecipeCard';
import { Recipe } from '../../types/Recipe';
import { RecipeForm } from '../../components/RecipeForm';
import UserDashboardLayout from '../../Layout/UserDashboardLayout';
const recipes: RecipeData[] = [
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
    id: 5,
    title: "Pizza Margherita",
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
    id: 6,
    title: "Morning Toast",
    category: "Breakfast",
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
    id: 7,
    title: "Katikati Lunch",
    imageUrl: katikati,
    category: "Lunch",
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
    id: 8,
    title: "Pepper Beef Steak",
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

// All available filters
const categories = ["Breakfast", "Lunch", "Dinner", "Vegetarian", "Desserts", "Baked Food"];
const difficulties = ["Easy", "Medium", "Hard", "Expert"];
const cookTimes = ["< 15 min", "15-30 min", "30-60 min", "> 60 min"];

const RecipesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [searchTerm, setSearchTerm] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openRecipeForm, setOpenRecipeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeData[]>(recipes);
  
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    cookTime: ''
  });

  // Handle saving a new recipe
  const handleSaveRecipe = (recipe: Recipe) => {
    console.log('New recipe created:', recipe);
    // Here you would typically save the recipe to your database
    // and update your UI as needed
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  // Reset all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      cookTime: ''
    });
  };

  // Apply filters to recipes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate network request delay
    const timer = setTimeout(() => {
      const filtered = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filters.category || recipe.category === filters.category;
        const matchesDifficulty = !filters.difficulty || recipe.difficulty === filters.difficulty;
        
        // Handle cook time range filter
        let matchesCookTime = true;
        if (filters.cookTime) {
          switch (filters.cookTime) {
            case '< 15 min':
              matchesCookTime = recipe.cookTime < 15;
              break;
            case '15-30 min':
              matchesCookTime = recipe.cookTime >= 15 && recipe.cookTime <= 30;
              break;
            case '30-60 min':
              matchesCookTime = recipe.cookTime > 30 && recipe.cookTime <= 60;
              break;
            case '> 60 min':
              matchesCookTime = recipe.cookTime > 60;
              break;
            default:
              matchesCookTime = true;
          }
        }
        
        return matchesSearch && matchesCategory && matchesDifficulty && matchesCookTime;
      });
      
      setFilteredRecipes(filtered);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Filter panel content
  const filterPanel = (
    <Box sx={{ p: 3, width: isMobile ? '100%' : 300 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <Box>
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
            <MenuItem key={category} value={category}>
              {category}
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
        <InputLabel id="cook-time-label">Cook Time</InputLabel>
        <Select
          labelId="cook-time-label"
          value={filters.cookTime}
          onChange={(e) => handleFilterChange('cookTime', e.target.value as string)}
          label="Cook Time"
        >
          <MenuItem value="">Any Time</MenuItem>
          {cookTimes.map((time) => (
            <MenuItem key={time} value={time}>
              {time}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={clearFilters}
        sx={{ mt: 2 }}
      >
        Clear All Filters
      </Button>
    </Box>
  );

  return (
    <UserDashboardLayout title="My Recipes">
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: { xs: 2, md: 3 },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          My Recipes
        </Typography>
        
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
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
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
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 120 }
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
            
            {/* Add Recipe button */}
            {/* <Button 
              variant="contained" 
              startIcon={!isMobile && <AddIcon />}
              onClick={() => setOpenRecipeForm(true)}
              sx={{
                backgroundColor: '#D97706',
                borderRadius: 6,
                '&:hover': {
                  backgroundColor: '#B45309',
                },
                textTransform: 'uppercase',
                fontWeight: 500,
                paddingX: { xs: 2, sm: 4 },
                paddingY: 1,
                minWidth: { xs: '100%', sm: 150 }
              }}
            >
              {isMobile ? <AddIcon /> : 'Add Recipe'}
            </Button> */}
          </Box>
        </Box>
        
        {/* Active filter chips for mobile/tablet */}
        {!isLargeScreen && activeFilterCount > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {filters.category && (
              <Chip 
                label={`Category: ${filters.category}`} 
                onDelete={() => handleFilterChange('category', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {filters.difficulty && (
              <Chip 
                label={`Difficulty: ${filters.difficulty}`} 
                onDelete={() => handleFilterChange('difficulty', '')}
                color="primary"
                variant="outlined"
              />
            )}
            {filters.cookTime && (
              <Chip 
                label={`Time: ${filters.cookTime}`} 
                onDelete={() => handleFilterChange('cookTime', '')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>
      
      {/* Main content area with filter sidebar and recipe grid */}
      <Box sx={{ display: 'flex' }}>
        {/* Filter sidebar for large screens */}
        {isLargeScreen && (
          <Box 
            component={Paper} 
            elevation={1} 
            sx={{ 
              width: 280, 
              mr: 4, 
              height: 'fit-content',
              position: 'sticky',
              top: 24,
              borderRadius: 2,
              display: { xs: 'none', lg: 'block' }
            }}
          >
            {filterPanel}
          </Box>
        )}
        
        {/* Recipe grid */}
        <Box sx={{ flexGrow: 1 }}>
          {filteredRecipes.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 6
              }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No recipes found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={isLargeScreen ? 4 : 6} lg={4} xl={3} key={recipe.id}>
                  <RecipeCard recipe={recipe} />
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
            borderTopLeftRadius: isMobile ? 0 : 12,
            borderBottomLeftRadius: isMobile ? 0 : 12,
          }
        }}
      >
        {filterPanel}
      </Drawer>
      
      {/* Recipe Form Modal */}
      <RecipeForm
        open={openRecipeForm}
        onClose={() => setOpenRecipeForm(false)}
        onSave={handleSaveRecipe}
      />
    </UserDashboardLayout>
  );
};

export default RecipesPage;