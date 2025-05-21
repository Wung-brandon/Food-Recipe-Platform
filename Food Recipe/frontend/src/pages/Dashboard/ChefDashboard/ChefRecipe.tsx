import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  FormControl,
  Select,
  SelectChangeEvent,
  CardMedia,
  CardActionArea,
  CardActions
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  Visibility as VisibilityIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  Drafts as DraftsIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../Layout/DashboardLayout';

interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: string;
  prepTime: string;
  published: boolean;
  dateCreated: string;
  views: number;
  likes: number;
  comments: number;
}

const ChefRecipes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filterByCategory, setFilterByCategory] = useState<string>('all');

  const sortOpen = Boolean(sortAnchorEl);
  const filterOpen = Boolean(filterAnchorEl);


  const sampleRecipes: Recipe[] = [
    {
      id: 1,
      title: 'Homemade Margherita Pizza',
      description: 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
      image: '/api/placeholder/300/200',
      category: 'Italian',
      difficulty: 'Medium',
      prepTime: '45 minutes',
      published: true,
      dateCreated: '2023-06-12',
      views: 1245,
      likes: 98,
      comments: 23
    },
    {
      id: 2,
      title: 'Chocolate Soufflé',
      description: 'Light and airy chocolate dessert that will impress your guests',
      image: '/api/placeholder/300/200',
      category: 'Dessert',
      difficulty: 'Hard',
      prepTime: '1 hour',
      published: true,
      dateCreated: '2023-07-15',
      views: 982,
      likes: 76,
      comments: 15
    },
    {
      id: 3,
      title: 'Beef Wellington',
      description: 'Tender beef fillet wrapped in mushroom duxelles and puff pastry',
      image: '/api/placeholder/300/200',
      category: 'British',
      difficulty: 'Hard',
      prepTime: '2 hours',
      published: true,
      dateCreated: '2023-08-03',
      views: 763,
      likes: 45,
      comments: 8
    },
    {
      id: 4,
      title: 'Thai Green Curry',
      description: 'Spicy and aromatic curry with coconut milk and fresh herbs',
      image: '/api/placeholder/300/200',
      category: 'Asian',
      difficulty: 'Medium',
      prepTime: '40 minutes',
      published: true,
      dateCreated: '2023-09-22',
      views: 641,
      likes: 39,
      comments: 5
    },
    {
      id: 5,
      title: 'Avocado Toast with Poached Eggs',
      description: 'Healthy breakfast option with creamy avocado and perfect poached eggs',
      image: '/api/placeholder/300/200',
      category: 'Breakfast',
      difficulty: 'Easy',
      prepTime: '20 minutes',
      published: false,
      dateCreated: '2023-10-05',
      views: 0,
      likes: 0,
      comments: 0
    },
    {
      id: 6,
      title: 'Classic French Onion Soup',
      description: 'Rich beef broth with caramelized onions and melted gruyère cheese',
      image: '/api/placeholder/300/200',
      category: 'French',
      difficulty: 'Medium',
      prepTime: '1 hour 30 minutes',
      published: false,
      dateCreated: '2023-10-18',
      views: 0,
      likes: 0,
      comments: 0
    }
  ];

  const categories = ['All', 'Italian', 'Dessert', 'British', 'Asian', 'Breakfast', 'French'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch this data from your API
        // For now, simulating API call with setTimeout
        setTimeout(() => {
          setRecipes(sampleRecipes);
          setFilteredRecipes(sampleRecipes);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, sortBy, filterByCategory, tabValue, recipes]);

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Filter by tab (published or drafts)
    if (tabValue === 0) {
      filtered = filtered.filter(recipe => recipe.published);
    } else {
      filtered = filtered.filter(recipe => !recipe.published);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filterByCategory && filterByCategory !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.category.toLowerCase() === filterByCategory.toLowerCase()
      );
    }

    // Sort recipes
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
        break;
      case 'most-viewed':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    setFilteredRecipes(filtered);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortChange = (option: string) => {
    setSortBy(option);
    handleSortClose();
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterByCategory(event.target.value as string);
  };

  const handleRecipeMenuClick = (event: React.MouseEvent<HTMLElement>, recipeId: number) => {
    event.stopPropagation();
    setSelectedRecipeId(recipeId);
  };

  const handleDeleteDialogOpen = (event: React.MouseEvent<HTMLElement>, recipeId: number) => {
    event.stopPropagation();
    setSelectedRecipeId(recipeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedRecipeId(null);
  };

  const handleRecipeDelete = () => {
    if (selectedRecipeId) {
      setRecipes(recipes.filter(recipe => recipe.id !== selectedRecipeId));
      setDeleteDialogOpen(false);
      setSelectedRecipeId(null);
    }
  };

  const handleRecipeEdit = (event: React.MouseEvent<HTMLElement>, recipeId: number) => {
    event.stopPropagation();
    // Navigate to edit recipe page
    navigate(`/chef/create-recipe?edit=${recipeId}`);
  };

  const handleRecipeClick = (recipeId: number) => {
    // Navigate to recipe details page
    navigate(`/recipe/${recipeId}`);
  };

  const handleCreateRecipe = () => {
    navigate('/dashboard/chef/create-recipe');
  };

  // Render the component with the DashboardLayout
  return (
    <DashboardLayout title="My Recipes">
      <Box>
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>My Recipes</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleCreateRecipe}
              sx={{ 
                bgcolor: '#d97706', 
                '&:hover': { bgcolor: '#b45309' }
              }}
            >
              Create New Recipe
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                '& .MuiTab-root.Mui-selected': { color: '#d97706' },
                '& .MuiTabs-indicator': { backgroundColor: '#d97706' }
              }}
            >
              <Tab label="Published" />
              <Tab label="Drafts" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              placeholder="Search recipes..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: '200px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterClick}
                size="small"
                sx={{ mr: 1, borderColor: '#d97706', color: '#d97706' }}
              >
                Filter
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={filterOpen}
                onClose={handleFilterClose}
              >
                <Box sx={{ p: 2, minWidth: '200px' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Filter by Category</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={filterByCategory}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((category, index) => (
                        category.toLowerCase() !== 'all' && (
                          <MenuItem key={index} value={category.toLowerCase()}>
                            {category}
                          </MenuItem>
                        )
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Menu>

              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={handleSortClick}
                size="small"
                sx={{ borderColor: '#d97706', color: '#d97706' }}
              >
                Sort
              </Button>
              <Menu
                anchorEl={sortAnchorEl}
                open={sortOpen}
                onClose={handleSortClose}
              >
                <MenuItem onClick={() => handleSortChange('newest')}>Newest First</MenuItem>
                <MenuItem onClick={() => handleSortChange('oldest')}>Oldest First</MenuItem>
                <MenuItem onClick={() => handleSortChange('most-viewed')}>Most Viewed</MenuItem>
                <MenuItem onClick={() => handleSortChange('most-liked')}>Most Liked</MenuItem>
              </Menu>
            </Box>
          </Box>

          {loading ? (
            <LinearProgress sx={{ my: 4 }} />
          ) : (
            <>
              {filteredRecipes.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 5, 
                  bgcolor: '#f9fafb', 
                  borderRadius: 2,
                  border: '1px dashed #d1d5db'
                }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {searchQuery ? 'No recipes match your search.' : tabValue === 0 ? 'No published recipes yet.' : 'No drafts yet.'}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleCreateRecipe}
                    sx={{ 
                      bgcolor: '#d97706', 
                      '&:hover': { bgcolor: '#b45309' }
                    }}
                  >
                    Create Your First Recipe
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <Card sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                      }}>
                        <CardActionArea onClick={() => handleRecipeClick(recipe.id)}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={recipe.image}
                            alt={recipe.title}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                                {recipe.title}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={(e) => handleRecipeMenuClick(e, recipe.id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {recipe.description.length > 80 
                                ? `${recipe.description.substring(0, 80)}...` 
                                : recipe.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={recipe.category} 
                                size="small" 
                                sx={{ bgcolor: '#fef3c7', color: '#92400e' }}
                              />
                              <Chip 
                                label={recipe.difficulty} 
                                size="small" 
                                sx={{ bgcolor: '#e0f2fe', color: '#075985' }}
                              />
                              <Chip 
                                label={recipe.prepTime} 
                                size="small" 
                                sx={{ bgcolor: '#f1f5f9', color: '#475569' }}
                              />
                            </Box>
                          </CardContent>
                        </CardActionArea>
                        
                        <CardActions sx={{ bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Box sx={{ display: 'flex' }}>
                              {recipe.published && (
                                <>
                                  <Tooltip title="Views">
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                      <VisibilityIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                                      <Typography variant="body2">{recipe.views}</Typography>
                                    </Box>
                                  </Tooltip>
                                  <Tooltip title="Likes">
                                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                      <ThumbUpIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                                      <Typography variant="body2">{recipe.likes}</Typography>
                                    </Box>
                                  </Tooltip>
                                  <Tooltip title="Comments">
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CommentIcon fontSize="small" sx={{ color: '#64748b', mr: 0.5 }} />
                                      <Typography variant="body2">{recipe.comments}</Typography>
                                    </Box>
                                  </Tooltip>
                                </>
                              )}
                              {!recipe.published && (
                                <Chip 
                                  label="Draft" 
                                  size="small" 
                                  sx={{ bgcolor: '#f1f5f9', color: '#64748b' }}
                                />
                              )}
                            </Box>
                            <Box>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => handleRecipeEdit(e, recipe.id)}
                                  sx={{ color: '#d97706' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={(e) => handleDeleteDialogOpen(e, recipe.id)}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteDialogClose}
        >
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} sx={{ color: '#64748b' }}>
              Cancel
            </Button>
            <Button onClick={handleRecipeDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ChefRecipes;