import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
//   Rating,
  Paper,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock categories data (in a real app, this would come from your API)
const categories = [
  'breakfast', 'lunch', 'dinner', 'dessert', 'appetizer', 
  'snack', 'drink', 'vegetarian', 'vegan', 'gluten-free'
];

// Difficulty options
const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];

const CreateRecipePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Define the type for the recipe state
  type Ingredient = { id: string; name: string; amount: string; checked: boolean };
  type Step = { id: string; description: string };
  type Author = { id: string; name: string; avatar: string };
  type Recipe = {
    id: string;
    title: string;
    description: string;
    image: string;
    imageFile: File | null;
    preparationTime: number;
    cookingTime: number;
    servings: number;
    difficulty: string;
    calories: number;
    rating: number;
    ratingCount: number;
    author: Author;
    ingredients: Ingredient[];
    steps: Step[];
    tips: string[];
    isFavorite: boolean;
    category: string;
    tags: string[];
  };

  // Initialize form state with default values
  const [recipe, setRecipe] = useState<Recipe>({
    id: `recipe-${Date.now()}`,
    title: '',
    description: '',
    image: '',
    imageFile: null,
    preparationTime: 0,
    cookingTime: 0,
    servings: 2,
    difficulty: 'Easy',
    calories: 0,
    rating: 0,
    ratingCount: 0,
    author: {
      id: 'user-1', // In a real app, this would be the current user's ID
      name: 'Chef Name', // In a real app, this would be the current user's name
      avatar: '' // In a real app, this would be the current user's avatar
    },
    ingredients: [{ id: `ing-${Date.now()}`, name: '', amount: '', checked: false }],
    steps: [{ id: `step-${Date.now()}`, description: '' }],
    tips: [''],
    isFavorite: false,
    category: '',
    tags: []
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for text field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  // Handler for number field changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: Number(value) });
  };

  // Handler for select field changes
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  // Handler for ingredient changes
type IngredientField = 'name' | 'amount';

const handleIngredientChange = (index: number, field: IngredientField, value: string) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setRecipe({ ...recipe, ingredients: updatedIngredients });
};

  // Add a new ingredient
  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { id: `ing-${Date.now()}`, name: '', amount: '', checked: false }]
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
      steps: [...recipe.steps, { id: `step-${Date.now()}`, description: '' }]
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
      // Create a URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      // In a real application, you would upload this file to your server
      // and get back a URL to store in the recipe.image field
      setRecipe({
        ...recipe,
        image: imageUrl,
        imageFile: file
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setRecipe({
      ...recipe,
      image: '',
      imageFile: null
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Recipe created:', recipe);
      
      // In a real app, you would upload the image file to your server here
      // and get back a URL to store in the recipe.image field
      
      // Navigate to recipes list or show success message
      navigate('/dashboard/chef/recipe');
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard/chef/recipe');
  };

  return (
    <DashboardLayout title="Create Recipe">
      <Paper className="p-6 shadow-md rounded-lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Create a New Recipe
          </Typography>
        </Box>

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

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Recipe Title"
                name="title"
                value={recipe.title}
                onChange={handleInputChange}
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={recipe.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
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
                name="preparationTime"
                value={recipe.preparationTime}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Cooking Time (mins)"
                name="cookingTime"
                value={recipe.cookingTime}
                onChange={handleNumberChange}
                inputProps={{ min: 0 }}
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
              {recipe.ingredients.map((ingredient, index) => (
                <Box key={ingredient.id} sx={{ 
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
              {recipe.steps.map((step, index) => (
                <Box key={step.id} sx={{ display: 'flex', mb: 2, alignItems: 'flex-start' }}>
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
                Tips and Tricks
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
                Tags
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
              {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </Box>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default CreateRecipePage;