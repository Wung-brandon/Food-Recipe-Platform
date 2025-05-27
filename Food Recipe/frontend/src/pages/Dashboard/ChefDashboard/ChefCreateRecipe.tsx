import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../Layout/DashboardLayout';
import {
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import { refreshAccessToken } from '../../../utils/AuthHelper';
import { useAuth } from '../../../context/AuthContext';

// API configuration
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  recipes: `${API_BASE_URL}/api/recipes/`,
  categories: `${API_BASE_URL}/api/categories/`,
  tags: `${API_BASE_URL}/api/tags/`,
};

// Difficulty options
const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  // Initialize form state with default values
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    image: null,
    video: null,
    preparation_time: 0,
    cooking_time: 0,
    servings: 2,
    difficulty: 'Easy',
    calories: 0,
    ingredients: [{ name: '', amount: '' }],
    steps: [{ description: '' }],
    tips: [''],
    category: '',
    tags: []
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  type Category = { id: number; name: string };
  type Tag = { id: number; name: string };

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const { token, logout } = useAuth();
  type RecipeFormErrors = {
    title?: string;
    description?: string;
    category?: string;
    preparation_time?: string;
    cooking_time?: string;
    servings?: string;
    ingredients?: string;
    steps?: string;
  };
  const [errors, setErrors] = useState<RecipeFormErrors>({});
  const { slug } = useParams<{ slug?: string }>();

  // Fetch categories and tags on component mount
  useEffect(() => {
    if (slug) {
    // Editing: fetch recipe details
    fetchRecipeForEdit(slug);
  }
    fetchCategories();
    fetchTags();
  }, [slug]);


const fetchRecipeForEdit = async (slug: string) => {
  setLoading(true);
  try {
    const response = await axios.get(`${API_ENDPOINTS.recipes}${slug}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = response.data;
    setRecipe({
      title: data.title || '',
      description: data.description || '',
      image: null, // You may want to handle image differently (see below)
      video: null,
      preparation_time: data.preparation_time || 0,
      cooking_time: data.cooking_time || 0,
      servings: data.servings || 2,
      difficulty: data.difficulty || 'Easy',
      calories: data.calories || 0,
      ingredients: data.ingredients || [{ name: '', amount: '' }],
      steps: data.steps || [{ description: '' }],
      tips: data.tips?.map((t: any) => t.description || t.tip || '') || [''],
      category: data.category?.name || data.category || '',
      tags: data.tags?.map((t: any) => t.name || t) || [],
    });
    // Optionally set image/video preview if you want to show existing media
    if (data.image) setImagePreview(data.image);
    if (data.video) setVideoPreview(data.video);
  } catch (error) {
    toast.error('Failed to load recipe for editing.');
    navigate('/dashboard/chef/recipe');
  } finally {
    setLoading(false);
  }
};
  // Fetch categories (public endpoint, no token needed)
const fetchCategories = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.categories);
    // If your API returns paginated results, use response.data.results
    setCategories(response.data.results || response.data);
    console.log('Fetched categories:', response.data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to default categories if API fails
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

// Fetch tags (public endpoint, no token needed)
const fetchTags = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.tags);
    setAvailableTags(response.data.results || response.data);
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
};

  // Handler for text field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handler for number field changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: Number(value) });
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handler for select field changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handler for ingredient changes
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  // Add a new ingredient
  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { name: '', amount: '' }]
    });
  };

  // Remove an ingredient
  const removeIngredient = (index) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  // Handler for step changes
  const handleStepChange = (index, value) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = { ...updatedSteps[index], description: value };
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  // Add a new step
  const addStep = () => {
    setRecipe({
      ...recipe,
      steps: [...recipe.steps, { description: '' }]
    });
  };

  // Remove a step
  const removeStep = (index) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps.splice(index, 1);
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  // Handler for tip changes
  const handleTipChange = (index, value) => {
    const updatedTips = [...recipe.tips];
    updatedTips[index] = value;
    setRecipe({ ...recipe, tips: updatedTips });
  };

  // Add a new tip
  const addTip = () => {
    setRecipe({
      ...recipe,
      tips: [...recipe.tips, '']
    });
  };

  // Remove a tip
  const removeTip = (index) => {
    const updatedTips = [...recipe.tips];
    updatedTips.splice(index, 1);
    setRecipe({ ...recipe, tips: updatedTips });
  };

  // Add a tag
  const addTag = () => {
    if (newTag && !recipe.tags.includes(newTag)) {
      setRecipe({
        ...recipe,
        tags: [...recipe.tags, newTag]
      });
      setNewTag('');
    }
  };

  // Remove a tag
  const removeTag = (tag) => {
    setRecipe({
      ...recipe,
      tags: recipe.tags.filter(t => t !== tag)
    });
  };

  // Handle tag input keypress (add tag on Enter)
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      addTag();
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setRecipe({
        ...recipe,
        image: file
      });
    }
  };

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size must be less than 50MB');
        return;
      }
      
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
      setRecipe({
        ...recipe,
        video: file
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Trigger video input click
  const triggerVideoInput = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  // Remove image
  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setRecipe({
      ...recipe,
      image: null
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove video
  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setRecipe({
      ...recipe,
      video: null
    });
    
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!recipe.title.trim()) {
      newErrors.title = 'Recipe title is required';
    }
    
    if (!recipe.description.trim()) {
      newErrors.description = 'Recipe description is required';
    }
    
    if (!recipe.category) {
      newErrors.category = 'Category is required';
    }
    
    if (recipe.preparation_time <= 0) {
      newErrors.preparation_time = 'Preparation time must be greater than 0';
    }
    
    if (recipe.cooking_time <= 0) {
      newErrors.cooking_time = 'Cooking time must be greater than 0';
    }
    
    if (recipe.servings <= 0) {
      newErrors.servings = 'Servings must be greater than 0';
    }
    
    // Validate ingredients
    const validIngredients = recipe.ingredients.filter(ing => ing.name.trim() && ing.amount.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    
    // Validate steps
    const validSteps = recipe.steps.filter(step => step.description.trim());
    if (validSteps.length === 0) {
      newErrors.steps = 'At least one preparation step is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // ...existing code...

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }

  setLoading(true);

  // Helper to actually send the recipe
  const createOrUpdateRecipe = async (authToken) => {
    // Debug: Log the raw recipe data structure
    console.log('Raw recipe data:', {
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tips: recipe.tips
    });

    // Prepare and validate ingredients
    let validIngredients = [];
    
    if (Array.isArray(recipe.ingredients)) {
      validIngredients = recipe.ingredients
        .map((ing, index) => {
          console.log(`Processing ingredient ${index + 1}:`, ing, typeof ing);
          
          // Handle different possible formats
          if (typeof ing === 'object' && ing !== null) {
            const name = ing.name || ing.ingredient || '';
            const amount = ing.amount || ing.quantity || '';
            if (name && name.toString().trim() && amount && amount.toString().trim()) {
              return {
                name: name.toString().trim(),
                amount: amount.toString().trim()
              };
            }
          } else if (typeof ing === 'string' && ing.includes(':')) {
            // Handle "name: amount" format
            const [name, amount] = ing.split(':').map(s => s.trim());
            if (name && amount) {
              return { name, amount };
            }
          }
          return null;
        })
        .filter(ing => ing !== null);
    }
    
    // Prepare and validate steps
    let validSteps = [];
    
    if (Array.isArray(recipe.steps)) {
      validSteps = recipe.steps
        .map((step, index) => {
          console.log(`Processing step ${index + 1}:`, step, typeof step);
          
          // Handle different possible formats
          if (typeof step === 'object' && step !== null) {
            const description = step.description || step.instruction || step.step || '';
            if (description && description.toString().trim()) {
              return {
                description: description.toString().trim()
              };
            }
          } else if (typeof step === 'string' && step.trim()) {
            return {
              description: step.trim()
            };
          }
          return null;
        })
        .filter(step => step !== null);
    }
    
    // Prepare tips
    let validTips = [];
    
    if (Array.isArray(recipe.tips)) {
      validTips = recipe.tips
        .map((tip, index) => {
          console.log(`Processing tip ${index + 1}:`, tip, typeof tip);
          
          // Handle different possible formats
          if (typeof tip === 'object' && tip !== null) {
            const description = tip.description || tip.tip || '';
            if (description && description.toString().trim()) {
              return {
                description: description.toString().trim()
              };
            }
          } else if (typeof tip === 'string' && tip.trim()) {
            return {
              description: tip.trim()
            };
          }
          return null;
        })
        .filter(tip => tip !== null);
    }

    // Debug: Log processed data
    console.log('Processed ingredients:', validIngredients);
    console.log('Processed steps:', validSteps);
    console.log('Processed tips:', validTips);

    // Validation checks
    if (validIngredients.length === 0) {
      console.error('No valid ingredients found. Raw ingredients:', recipe.ingredients);
      toast.error('At least one ingredient is required');
      setLoading(false);
      return;
    }
    
    if (validSteps.length === 0) {
      console.error('No valid steps found. Raw steps:', recipe.steps);
      toast.error('At least one step is required'); 
      setLoading(false);
      return;
    }

    // Final validation - ensure all ingredients have required fields
    const invalidIngredients = validIngredients.filter(ing => !ing.name || !ing.amount);
    if (invalidIngredients.length > 0) {
      console.error('Invalid ingredients found:', invalidIngredients);
      toast.error('All ingredients must have both name and amount');
      setLoading(false);
      return;
    }

    // Final validation - ensure all steps have required fields
    const invalidSteps = validSteps.filter(step => !step.description);
    if (invalidSteps.length > 0) {
      console.error('Invalid steps found:', invalidSteps);
      toast.error('All steps must have a description');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!recipe.title || !recipe.title.trim()) {
      toast.error('Recipe title is required');
      setLoading(false);
      return;
    }

    if (!recipe.description || !recipe.description.trim()) {
      toast.error('Recipe description is required');
      setLoading(false);
      return;
    }

    if (!recipe.category) {
      toast.error('Recipe category is required');
      setLoading(false);
      return;
    }

    // Use FormData for file uploads
    const formData = new FormData();
    
    // Basic fields - ensure all required fields are included
    formData.append('title', recipe.title.trim());
    formData.append('description', recipe.description.trim());
    formData.append('preparation_time', recipe.preparation_time.toString());
    formData.append('cooking_time', recipe.cooking_time.toString());
    formData.append('servings', recipe.servings.toString());
    formData.append('difficulty', recipe.difficulty);
    
    // Only append calories if it has a value
    if (recipe.calories && recipe.calories > 0) {
      formData.append('calories', recipe.calories.toString());
    }
    
    formData.append('category', recipe.category);
    
    // Files (only if they exist)
    if (recipe.image) formData.append('image', recipe.image);
    if (recipe.video) formData.append('video', recipe.video);
    
    // Nested data as JSON strings - with proper object structure
    formData.append('ingredients', JSON.stringify(validIngredients));
    formData.append('steps', JSON.stringify(validSteps));
    
    if (validTips.length > 0) {
      formData.append('tips', JSON.stringify(validTips));
    }
    
    // Tags (only if they exist)
    if (recipe.tags && recipe.tags.length > 0) {
      formData.append('tags', JSON.stringify(recipe.tags));
    }

    // Debug: Log what we're sending
    console.log('Sending recipe data:');
    console.log('Valid Ingredients:', validIngredients);
    console.log('Valid Steps:', validSteps);
    console.log('Valid Tips:', validTips);
    
    for (let [key, value] of formData.entries()) {
      if (key === 'image' || key === 'video') {
        console.log(`${key}:`, value ? `File: ${value.name}` : 'No file');
      } else {
        console.log(`${key}:`, value);
      }
    }

    if (slug) {
    // Edit mode: PATCH (or PUT)
    return await fetch(`${API_ENDPOINTS.recipes}${slug}/`, {
      method: 'PATCH', // or 'PUT' if you want to replace all fields
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });
  } else {
    // Create mode
    return await fetch(API_ENDPOINTS.recipes, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });
  }
  };

  try {
    let currentToken = token;
    let response = await createOrUpdateRecipe(currentToken);

    // If 401, try to refresh and retry once
    if (response && response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        currentToken = newToken;
        response = await createOrUpdateRecipe(currentToken);
      } else {
        toast.error('Session expired. Please log in again.');
        logout();
        navigate('/login');
        return;
      }
    }

    // Handle the response
    if (response && response.ok) {
      const data = await response.json();
      toast.success(slug ? 'Recipe updated successfully!' : 'Recipe created successfully!');
      navigate('/dashboard/chef/recipe');
    } else if (response) {
      const errorData = await response.json();
      console.log('Error response:', errorData); // For debugging
      
      if (response.status === 403) {
        toast.error(errorData.detail || 'You are not authorized to create recipes.');
      } else if (response.status === 400) {
        // Better error handling for validation errors
        let errorMessage = '';
        
        if (typeof errorData === 'object' && errorData !== null) {
          const errorMessages = [];
          
          Object.entries(errorData).forEach(([field, errors]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
            const errorText = Array.isArray(errors) ? errors.join(', ') : errors;
            errorMessages.push(`${fieldName}: ${errorText}`);
          });
          
          errorMessage = errorMessages.join(' | ');
        } else {
          errorMessage = errorData.detail || 'Validation error occurred';
        }
        
        toast.error(errorMessage);
      } else {
        toast.error(`Server error (${response.status}). Please try again.`);
      }
    } else {
      toast.error('No response received from the server.');
    }
  } catch (error) {
    console.error('Network error:', error); // For debugging
    toast.error('Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
};

  // Handle cancel
  const handleCancel = () => {
    // Clean up object URLs
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    navigate('/dashboard/chef/recipe');
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview]);

  return (
    <DashboardLayout title={`${slug ? 'Edit Recipe' : 'Create Recipe'}`}>
      <Paper className="p-6 shadow-md rounded-lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={handleCancel}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
              {loading ? (slug ? 'Updating...' : 'Creating...') : (slug ? 'Edit Recipe' : 'Create a New Recipe')}
          </Typography>
        </Box>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Please fix the errors below before submitting.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom fontWeight="medium" color="text.primary">
                Basic Information
              </Typography>
            </Grid>

            {/* Recipe Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Recipe Image
              </Typography>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              {imagePreview ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mb: 2 }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 1, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={imagePreview} 
                      alt="Recipe preview" 
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }} 
                    />
                    <IconButton
                      aria-label="delete image"
                      onClick={removeImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={triggerFileInput}
                  sx={{ mb: 3 }}
                >
                  Upload Recipe Image
                </Button>
              )}
            </Grid>

            {/* Recipe Video Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Recipe Video (Optional)
              </Typography>
              <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                style={{ display: 'none' }}
                onChange={handleVideoUpload}
              />
              {videoPreview ? (
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mb: 2 }}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 1, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <video 
                      src={videoPreview} 
                      controls
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: '300px',
                        borderRadius: '8px'
                      }} 
                    />
                    <IconButton
                      aria-label="delete video"
                      onClick={removeVideo}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<VideoCallIcon />}
                  onClick={triggerVideoInput}
                  sx={{ mb: 3 }}
                >
                  Upload Recipe Video
                </Button>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Recipe Title"
                name="title"
                value={recipe.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={recipe.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
            <FormControl fullWidth required error={!!errors.category}>
              <Autocomplete
                freeSolo
                options={categories.map((cat) => cat.name)}
                value={recipe.category}
                onChange={(_, newValue) => {
                  setRecipe({ ...recipe, category: newValue || '' });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                onInputChange={(_, newInputValue) => {
                  setRecipe({ ...recipe, category: newInputValue });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    error={!!errors.category}
                    helperText={errors.category}
                  />
                )}
              />
            </FormControl>
          </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  name="difficulty"
                  value={recipe.difficulty}
                  onChange={handleSelectChange}
                  label="Difficulty"
                >
                  {difficultyOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Preparation Time (mins)"
                name="preparation_time"
                value={recipe.preparation_time}
                onChange={handleNumberChange}
                inputProps={{ min: 1 }}
                error={!!errors.preparation_time}
                helperText={errors.preparation_time}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Cooking Time (mins)"
                name="cooking_time"
                value={recipe.cooking_time}
                onChange={handleNumberChange}
                inputProps={{ min: 1 }}
                error={!!errors.cooking_time}
                helperText={errors.cooking_time}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Servings"
                name="servings"
                value={recipe.servings}
                onChange={handleNumberChange}
                inputProps={{ min: 1 }}
                error={!!errors.servings}
                helperText={errors.servings}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Calories per Serving"
                name="calories"
                value={recipe.calories}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Ingredients Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }} fontWeight="medium" color="text.primary">
                Ingredients
              </Typography>
              {errors.ingredients && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.ingredients}
                </Alert>
              )}
              {recipe.ingredients.map((ingredient, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <TextField
                    required
                    label="Ingredient Name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    sx={{ mr: { xs: 0, sm: 2 }, flex: 2, width: { xs: '100%', sm: 'auto' } }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: undefined, sm: 1 }
                  }}>
                    <TextField
                      required
                      label="Amount"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      sx={{ mr: 2, flex: { xs: 1, sm: undefined } }}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => removeIngredient(index)}
                      disabled={recipe.ingredients.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Button 
                startIcon={<AddIcon />} 
                onClick={addIngredient}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Ingredient
              </Button>
            </Grid>

            {/* Steps Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }} fontWeight="medium" color="text.primary">
                Preparation Steps
              </Typography>
              {errors.steps && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.steps}
                </Alert>
              )}
              {recipe.steps.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ mr: 2, minWidth: '30px', pt: 2 }}>
                    {index + 1}.
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    multiline
                    label={`Step ${index + 1}`}
                    value={step.description}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeStep(index)}
                    disabled={recipe.steps.length <= 1}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                startIcon={<AddIcon />} 
                onClick={addStep}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Step
              </Button>
            </Grid>

            {/* Tips Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }} fontWeight="medium" color="text.primary">
                Tips and Tricks (Optional)
              </Typography>
              {recipe.tips.map((tip, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    label={`Tip ${index + 1}`}
                    value={tip}
                    onChange={(e) => handleTipChange(index, e.target.value)}
                    sx={{ mr: 2 }}
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => removeTip(index)}
                    disabled={recipe.tips.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button 
                startIcon={<AddIcon />} 
                onClick={addTip}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Tip
              </Button>
            </Grid>

            {/* Tags Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }} fontWeight="medium" color="text.primary">
                Tags (Optional)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <TextField
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  sx={{ mr: { xs: 0, sm: 2 }, flex: 1, width: { xs: '100%', sm: 'auto' } }}
                />
                <Button 
                  variant="outlined" 
                  onClick={addTag}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recipe.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 2 }
          }}>
            <Button 
              onClick={handleCancel} 
              variant="outlined"
              disabled={loading}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#D97706',
                '&:hover': {
                  bgcolor: '#B45309',
                }
              }}
            >
               {loading ? (slug ? 'Updating...' : 'Creating...') : (slug ? 'Update Recipe' : 'Create Recipe')}
            </Button>
          </Box>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default CreateRecipePage;

