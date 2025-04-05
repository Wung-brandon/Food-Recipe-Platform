import React, { useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Restaurant as MealIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

// Interfaces for Meal Planning
interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipe: string;
  calories: number;
  date: string;
}

// Initial Static Meal Data
const initialMeals: Meal[] = [
  {
    id: '1',
    name: 'Avocado Toast',
    type: 'Breakfast',
    recipe: 'Whole grain toast with mashed avocado, cherry tomatoes, and poached egg',
    calories: 350,
    date: '2024-03-20'
  },
  {
    id: '2',
    name: 'Quinoa Salad',
    type: 'Lunch',
    recipe: 'Quinoa, mixed greens, grilled chicken, feta cheese, and lemon vinaigrette',
    calories: 450,
    date: '2024-03-20'
  },
  {
    id: '3',
    name: 'Salmon with Roasted Vegetables',
    type: 'Dinner',
    recipe: 'Baked salmon with roasted asparagus, sweet potato, and herb seasoning',
    calories: 550,
    date: '2024-03-21'
  }
];

const MealPlannerPage: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [openModal, setOpenModal] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal Handlers
  const handleOpenModal = (meal?: Meal) => {
    setCurrentMeal(meal || {
      id: '',
      name: '',
      type: 'Breakfast',
      recipe: '',
      calories: 0,
      date: selectedDate
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentMeal(null);
  };

  // CRUD Operations
  const handleSaveMeal = () => {
    if (currentMeal) {
      if (currentMeal.id) {
        // Edit existing meal
        setMeals(meals.map(meal => 
          meal.id === currentMeal.id ? currentMeal : meal
        ));
      } else {
        // Add new meal
        const newMeal = {
          ...currentMeal,
          id: `${meals.length + 1}`
        };
        setMeals([...meals, newMeal]);
      }
      handleCloseModal();
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  // Grouped Meals by Date
  const groupedMeals = meals.reduce((acc, meal) => {
    if (!acc[meal.date]) {
      acc[meal.date] = [];
    }
    acc[meal.date].push(meal);
    return acc;
  }, {} as Record<string, Meal[]>);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <MealIcon className="text-amber-600" fontSize="large" />
          <Typography variant="h4" className="font-bold">
            Meal Planner
          </Typography>
        </div>
        <div>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            className="ml-4 bg-amber-600 hover:bg-amber-700"
          >
            Add Meal
          </Button>
        </div>
      </div>

      {/* Meal Planning Grid */}
      <Grid container spacing={3}>
        {Object.entries(groupedMeals).map(([date, dateMeals]) => (
          <Grid item xs={12} key={date}>
            <Card>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h6">
                    <CalendarIcon className="mr-2 text-amber-600" />
                    {new Date(date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="subtitle1" className="text-gray-600">
                    Total Calories: {dateMeals.reduce((sum, meal) => sum + meal.calories, 0)}
                  </Typography>
                </div>
                {dateMeals.map((meal) => (
                  <Card 
                    key={meal.id} 
                    variant="outlined" 
                    className="mb-3 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="flex justify-between items-center">
                      <div>
                        <Typography variant="h6">{meal.name}</Typography>
                        <Chip 
                          label={meal.type} 
                          size="small" 
                          className="mr-2 bg-amber-100 text-amber-800" 
                        />
                        <Typography variant="body2" className="text-gray-600">
                          {meal.calories} Calories
                        </Typography>
                      </div>
                      <div>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenModal(meal)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Meal Modal */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentMeal?.id ? 'Edit Meal' : 'Add New Meal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meal Name"
                value={currentMeal?.name || ''}
                onChange={(e) => setCurrentMeal(prev => 
                  prev ? {...prev, name: e.target.value} : null
                )}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={currentMeal?.type || 'Breakfast'}
                  onChange={(e) => setCurrentMeal(prev => 
                    prev ? {...prev, type: e.target.value as any} : null
                  )}
                  label="Meal Type"
                >
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                  <MenuItem value="Snack">Snack</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Calories"
                value={currentMeal?.calories || ''}
                onChange={(e) => setCurrentMeal(prev => 
                  prev ? {...prev, calories: Number(e.target.value)} : null
                )}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipe Description"
                multiline
                rows={4}
                value={currentMeal?.recipe || ''}
                onChange={(e) => setCurrentMeal(prev => 
                  prev ? {...prev, recipe: e.target.value} : null
                )}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Meal Date"
                value={currentMeal?.date || selectedDate}
                onChange={(e) => setCurrentMeal(prev => 
                  prev ? {...prev, date: e.target.value} : null
                )}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMeal} 
            color="primary" 
            variant="contained"
            className="bg-amber-600 hover:bg-amber-700"
          >
            Save Meal
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MealPlannerPage;