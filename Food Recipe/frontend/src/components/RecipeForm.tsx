import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Chip,
  Box,
  Rating,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Recipe } from '../types/Recipe';

// Mock categories data (in a real app, this would come from your API)
const categories = [
  'breakfast', 'lunch', 'dinner', 'dessert', 'appetizer', 
  'snack', 'drink', 'vegetarian', 'vegan', 'gluten-free'
];

// Difficulty options
const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Expert'];

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  editRecipe?: Recipe | null;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ open, onClose, onSave, editRecipe = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form state with editRecipe if provided, otherwise use default values
  const [recipe, setRecipe] = useState<Recipe>(editRecipe || {
    id: `recipe-${Date.now()}`,
    title: '',
    description: '',
    image: '',
    imageFile: null, // New field to store the file object
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
  
  const [imagePreview, setImagePreview] = useState<string | null>(editRecipe?.image || null);
  const [newTag, setNewTag] = useState('');

  // Handler for text field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  // Handler for number field changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: Number(value) });
  };

  // Handler for select field changes
  const handleSelectChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  // Handler for ingredient changes
  const handleIngredientChange = (index: number, field: keyof typeof recipe.ingredients[0], value: string) => {
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
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredients: updatedIngredients });
  };

  // Handler for step changes
  const handleStepChange = (index: number, value: string) => {
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
  const removeStep = (index: number) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps.splice(index, 1);
    setRecipe({ ...recipe, steps: updatedSteps });
  };

  // Handler for tip changes
  const handleTipChange = (index: number, value: string) => {
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
  const removeTip = (index: number) => {
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
  const removeTag = (tag: string) => {
    setRecipe({
      ...recipe,
      tags: recipe.tags.filter(t => t !== tag)
    });
  };

  // Handle tag input keypress (add tag on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      addTag();
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      // In a real application, you would upload this file to your server
      // and get back a URL to store in the recipe.image field
      // For now, we'll store both the file and the preview URL
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would upload the image file to your server here
    // and get back a URL to store in the recipe.image field
    
    onSave(recipe);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        style: { borderRadius: isMobile ? 0 : '12px' }
      }}
    >
      <DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {editRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </Typography>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ overflowY: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
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

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="legend">Rating:</Typography>
                <Rating
                  name="rating"
                  value={recipe.rating}
                  precision={0.1}
                  onChange={(_, newValue) => {
                    setRecipe({ ...recipe, rating: newValue || 0 });
                  }}
                />
                <Typography sx={{ ml: 2 }}>{recipe.rating}</Typography>
              </Box>
            </Grid>

            {/* Ingredients Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Ingredients
              </Typography>
              {recipe.ingredients.map((ingredient, index) => (
                <Box key={ingredient.id} sx={{ 
                  display: 'flex', 
                  mb: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 2 : 0
                }}>
                  <TextField
                    required
                    label="Ingredient Name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    sx={{ mr: isMobile ? 0 : 2, flex: 2, width: isMobile ? '100%' : 'auto' }}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: isMobile ? '100%' : 'auto',
                    flex: isMobile ? undefined : 1
                  }}>
                    <TextField
                      required
                      label="Amount"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      sx={{ mr: 2, flex: isMobile ? 1 : undefined }}
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
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
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
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Tags
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <TextField
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  sx={{ mr: isMobile ? 0 : 2, flex: 1, width: isMobile ? '100%' : 'auto' }}
                />
                <Button 
                  variant="outlined" 
                  onClick={addTag}
                  sx={{ width: isMobile ? '100%' : 'auto' }}
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
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          fullWidth={isMobile}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          fullWidth={isMobile}
          sx={{ 
            bgcolor: '#D97706',
            '&:hover': {
              bgcolor: '#B45309',
            }
          }}
        >
          {editRecipe ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Usage example component with Add Recipe button
const RecipeFormWrapper: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  
  const handleAddRecipe = (recipe: Recipe) => {
    console.log('New Recipe:', recipe);
    // Here you would normally save the recipe to your database
    
    // If you want to handle the image upload in a real application:
    if (recipe.imageFile) {
      // Create a FormData object to send to your backend
      const formData = new FormData();
      formData.append('image', recipe.imageFile);
      formData.append('recipeId', recipe.id);
      
      // Example of how you might upload the image
      // fetch('/api/upload-image', {
      //   method: 'POST',
      //   body: formData
      // })
      // .then(response => response.json())
      // .then(data => {
      //   // Update recipe with actual image URL from server
      //   const updatedRecipe = {...recipe, image: data.imageUrl};
      //   // Then save the recipe with the updated image URL
      //   // saveRecipeToDatabase(updatedRecipe);
      // });
    } else {
      // If no image, just save the recipe
      // saveRecipeToDatabase(recipe);
    }
  };
  
  return (
    <>
      <Button 
        variant="contained" 
        onClick={() => setOpenForm(true)}
        sx={{
          backgroundColor: '#D97706',
          borderRadius: '9999px',
          '&:hover': {
            backgroundColor: '#B45309',
          },
          textTransform: 'uppercase',
          fontWeight: 500,
          paddingX: 4,
          paddingY: 1.5,
        }}
      >
        Add Recipe
      </Button>
      
      <RecipeForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleAddRecipe}
      />
    </>
  );
};

export default RecipeFormWrapper;
export { RecipeForm }; // Export the form component separately for reuse