import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  LinearProgress,
  Paper,
  InputAdornment,
  TextField,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  Select,
  SelectChangeEvent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../Layout/DashboardLayout';
import RecipeCard from '../../../components/RecipeCard';
import { RecipeData } from '../../../types/Recipe';
import axios from 'axios';
import { refreshAccessToken } from '../../../utils/AuthHelper';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/api/recipes/`,
  categories: `${API_BASE_URL}/api/categories/`,
};

const ChefRecipes: React.FC = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterByCategory, setFilterByCategory] = useState<string>('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(filterAnchorEl);

  // For delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<null | number>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.categories);
      setCategories(response.data.results || response.data);
    } catch (error) {
      setCategories([
        { id: 1, name: 'Dinner' },
        { id: 2, name: 'Lunch' },
        { id: 3, name: 'Breakfast' },
        { id: 4, name: 'Traditional African' },
        { id: 5, name: 'Vegetarian' },
        { id: 6, name: 'Appetizer' }
      ]);
    }
  };

  // Fetch recipes for the logged-in chef
  const fetchRecipes = async () => {
    setLoading(true);

    const getRecipes = async (authToken: string | null) => {
      const params: any = {
        user: user?.id,
      };
      if (searchQuery) params.search = searchQuery;
      if (filterByCategory) params.category = filterByCategory;

      return await axios.get(API_ENDPOINTS.recipes, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params,
        validateStatus: () => true,
      });
    };

    try {
      let currentToken = token;
      let response = await getRecipes(currentToken);

      if (response && response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          currentToken = newToken;
          response = await getRecipes(currentToken);
        } else {
          toast.error('Session expired. Please log in again.');
          logout();
          navigate('/login');
          return;
        }
      }

      if (response && response.status === 200) {
        const data = (response.data.results || response.data).map((recipe: any) => ({
          id: recipe.id,
          title: recipe.title,
          category: recipe.category?.name || recipe.category || '',
          imageUrl: recipe.image || '/api/placeholder/300/200',
          cookTime: recipe.cooking_time || 0,
          difficulty: recipe.difficulty || '',
          rating: recipe.rating || 0,
          reviewCount: recipe.review_count || 0,
          author: {
            name: recipe.chef_name || user?.username || 'Chef',
            avatarUrl: recipe.chef_avatar || '',
          },
          isSaved: false,
          isLiked: false,
          likeCount: recipe.likes || 0,
          createdAt: recipe.created_at || '',
        }));
        setRecipes(data);
        setFilteredRecipes(data);
      } else {
        setRecipes([]);
        setFilteredRecipes([]);
        if (response && response.status !== 200) {
          toast.error('Failed to fetch recipes.');
        }
      }
    } catch (error) {
      setRecipes([]);
      setFilteredRecipes([]);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRecipes();
    // eslint-disable-next-line
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = [...recipes];
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterByCategory) {
      filtered = filtered.filter(recipe =>
        recipe.category === filterByCategory
      );
    }
    setFilteredRecipes(filtered);
  }, [searchQuery, filterByCategory, recipes]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterByCategory(event.target.value as string);
    handleFilterClose();
  };

  const handleCreateRecipe = () => {
    navigate('/dashboard/chef/create-recipe');
  };

  // View details handler
const handleViewDetails = (slug: string) => {
  navigate(`/recipes/${slug}`);
};

// Edit handler
const handleEditRecipe = (slug: string) => {
  navigate(`/dashboard/chef/edit-recipe/${slug}`);
};

// Delete handlers
const handleDeleteClick = (slug: string) => {
  setRecipeToDelete(slug);
  setDeleteDialogOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!recipeToDelete) return;
  setLoading(true);
  try {
    const currentToken = token;
    let response = await axios.delete(`${API_ENDPOINTS.recipes}${recipeToDelete}/`, {
      headers: { Authorization: `Bearer ${currentToken}` },
      validateStatus: () => true,
    });

    // If 401, try refresh and retry once
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await axios.delete(`${API_ENDPOINTS.recipes}${recipeToDelete}/`, {
          headers: { Authorization: `Bearer ${newToken}` },
          validateStatus: () => true,
        });
      } else {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
    }

    if (response.status === 204) {
      toast.success('Recipe deleted successfully!');
      // setRecipes(recipes.filter(r => r.slug !== recipeToDelete));
      // setFilteredRecipes(filteredRecipes.filter(r => r.slug !== recipeToDelete));
      setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete));
      setFilteredRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete));
    } else {
      toast.error('Failed to delete recipe.');
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
  } finally {
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
    setLoading(false);
  }
};

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

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
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
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
                    {searchQuery ? 'No recipes match your search.' : 'No recipes yet.'}
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
                      <Box
                        sx={{
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover .recipe-actions': { opacity: 1 }
                        }}
                        onClick={() => handleViewDetails(recipe.id)}
                      >
                        <RecipeCard
                          recipe={recipe}
                          currentUserId={user?.id}
                          onEdit={() => handleEditRecipe(String(recipe.id))}
                          onDelete={() => handleDeleteClick(String(recipe.id))}
                          dashboardType="chef"
                          />
                        
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Paper>
        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Recipe</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ChefRecipes;