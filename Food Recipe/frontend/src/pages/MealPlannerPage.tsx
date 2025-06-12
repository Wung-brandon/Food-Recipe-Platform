/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UserDashboardLayout from '../Layout/UserDashboardLayout';
import { toast } from 'react-toastify';
import { ShoppingList, 
        Preferences, 
        MealPlan,
        MealPlanEntry
       } from '../types/MealPlannerTypes';


const API_BASE_URL = 'http://localhost:8000';

const UserMealPlannerPage: React.FC = () => {
  const { token } = useAuth();

  const [preferences, setPreferences] = useState<Preferences>({
    num_days: 7,
    meal_types: ['Breakfast', 'Lunch', 'Dinner'],
  });
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editEntry, setEditEntry] = useState<MealPlanEntry | null>(null);
  const [editForm, setEditForm] = useState({ meal_type: '', recipe_title: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState<MealPlanEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Fetch current meal plan on mount
  useEffect(() => {
    if (token) {
      fetchCurrentMealPlan();
    }
  }, [token]);

  const fetchCurrentMealPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/meal-plans/current/`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMealPlan(response.data);
      // Fetch shopping list if meal plan exists
      if (response.data && response.data.id) {
        fetchShoppingList(response.data.id);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No meal plan found - this is normal for new users
        setMealPlan(null);
      } else {
        toast.error('Failed to fetch current meal plan.');
        setError('Failed to fetch meal plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
  setLoading(true);
  setError(null);
  setSuccess(null);
  
  try {
    console.log('Generating meal plan with preferences:', preferences);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/meal-plans/`,
      { preferences },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
      }
    );
    
    toast.success('Meal plan generated successfully!');
    console.log('Meal plan generated successfully:', response.data);
    setMealPlan(response.data);
    setSuccess('Meal plan generated successfully!');
    
    if (response.data && response.data.id) {
      fetchShoppingList(response.data.id);
    }
  } catch (err) {
    console.error('Error generating meal plan:', err);
    
    let errorMessage = 'Failed to generate meal plan.';
    let errorDetail = '';
    
    if (err.response) {
      // Server responded with error status
      toast.error('Error generating meal plan: ' + (err.response.data.error || 'Unknown error'));
      console.error('Error response:', err.response.data);
      console.error('Error status:', err.response.status);
      
      if (err.response.data) {
        errorMessage = err.response.data.error || errorMessage;
        errorDetail = err.response.data.detail || '';
        
        // Log the full error for debugging
        console.error('Server error details:', {
          message: errorMessage,
          detail: errorDetail,
          status: err.response.status,
          data: err.response.data
        });
      }
    } else if (err.request) {
      // Request was made but no response received
      toast.error('No response from server. Please check your connection.');
      console.error('No response received:', err.request);
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      console.error('Request setup error:', err.message);
      errorMessage = `Request error: ${err.message}`;
    }
    
    // Set error message for display
    const fullError = errorDetail ? `${errorMessage}\n${errorDetail}` : errorMessage;
    setError(fullError);
    
    // Also log current preferences for debugging
    console.log('Current preferences when error occurred:', preferences);
    
  } finally {
    setLoading(false);
  }
};

// Add this function to validate preferences before sending
// const validatePreferences = (prefs: any) => {
//   const errors: string[] = [];
  
//   if (!prefs) {
//     toast.info('No preferences set, using defaults.');
//     errors.push('Preferences object is missing');
//     return errors;
//   }
  
//   if (!prefs.num_days || prefs.num_days <= 0 || prefs.num_days > 30) {
//     toast.info('Number of days must be between 1 and 30');
//     errors.push('Number of days must be between 1 and 30');
//   }
  
//   if (!prefs.meal_types || !Array.isArray(prefs.meal_types) || prefs.meal_types.length === 0) {
//     toast.info('At least one meal type must be selected');
//     errors.push('At least one meal type must be selected');
//   }
  
//   const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
//   if (prefs.meal_types) {
//     const invalidTypes = prefs.meal_types.filter((type: string) => !validMealTypes.includes(type));
//     if (invalidTypes.length > 0) {
//       toast.info(`Invalid meal types: ${invalidTypes.join(', ')}`);
//       errors.push(`Invalid meal types: ${invalidTypes.join(', ')}`);
//     }
//   }
  
//   return errors;
// };

// Fetch shopping list for a meal plan
const fetchShoppingList = async (mealPlanId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/meal-plans/${mealPlanId}/shopping-list/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    setShoppingList(response.data);
  } catch (err) {
    console.error('Failed to fetch shopping list:', err);
  }
};


  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prevPrefs => ({
      ...prevPrefs,
      [name]: name === 'num_days' || name === 'max_cooking_time' ? parseInt(value) || 0 : value,
    }));
  };

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setPreferences(prevPrefs => {
      const mealTypes = checked
        ? [...prevPrefs.meal_types, value]
        : prevPrefs.meal_types.filter(type => type !== value);
      return { ...prevPrefs, meal_types: mealTypes };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMealTypeColor = (mealType: string) => {
    const colors = {
      'Breakfast': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Lunch': 'bg-blue-100 text-blue-800 border-blue-200',
      'Dinner': 'bg-purple-100 text-purple-800 border-purple-200',
      'Snack': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[mealType as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  const handleEditClick = (entry: MealPlanEntry) => {
  setEditEntry(entry);
  setEditForm({ meal_type: entry.meal_type, recipe_title: entry.recipe.title });
};

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
  if (!editEntry) return;
  setEditLoading(true);
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/meal-plans/entries/${editEntry.id}/`,
      {
        meal_type: editForm.meal_type,
        // You may need to send recipe ID or other fields as required by your backend
        recipe_id: editEntry.recipe.id,
        date: editEntry.date, // Keep the original date
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    console.log('Meal entry updated:', response.data);
    toast.success('Meal entry updated!');
    setEditEntry(null);
    fetchCurrentMealPlan(); // Refresh the plan
  } catch (err) {
    let errorMsg = 'Failed to update entry.';
  if (err.response?.data) {
    if (typeof err.response.data === 'string') {
      errorMsg += ' ' + err.response.data;
    } else if (err.response.data.detail) {
      errorMsg += ' ' + err.response.data.detail;
    } else if (err.response.data.error) {
      errorMsg += ' ' + err.response.data.error;
    } else {
      errorMsg += ' ' + JSON.stringify(err.response.data);
    }
  }
  toast.error(errorMsg);
  console.error('Edit error:', errorMsg);
} finally {
  setEditLoading(false);
}
};

const handleDeleteClick = (entry: MealPlanEntry) => {
  setDeleteEntry(entry);
};

const handleDeleteConfirm = async () => {
  if (!deleteEntry) return;
  setDeleteLoading(true);
  try {
    await axios.delete(
      `${API_BASE_URL}/api/meal-plans/entries/${deleteEntry.id}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    toast.success('Meal entry deleted successfully!');
    setDeleteEntry(null);
    fetchCurrentMealPlan(); // Refresh the plan
  } catch (err) {
    toast.error('Failed to delete entry.');
    console.error('Delete error:', err);
  } finally {
    setDeleteLoading(false);
  }
};


  return (
    <UserDashboardLayout title="Meal Planner">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <CalendarMonthIcon className="text-white" fontSize="large" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  AI Meal Planner
                </h1>
                <p className="text-gray-600 mt-1">Create personalized meal plans tailored to your preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Preferences Form */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-10 border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <SettingsIcon className="text-white" fontSize="large" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Meal Preferences</h2>
                  <p className="text-indigo-100 mt-1">Customize your meal plan to match your lifestyle</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Number of Days */}
                  <div className="group">
                    <label htmlFor="num_days" className="block text-sm font-semibold text-gray-700 mb-2">
                      Plan Duration
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="num_days"
                        id="num_days"
                        value={preferences.num_days}
                        onChange={handlePreferenceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-400"
                        min="1"
                        max="14"
                        placeholder="Enter number of days"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="group">
                    <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-700 mb-2">
                      Cooking Difficulty
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={preferences.difficulty || ''}
                      onChange={handlePreferenceChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-400 bg-white"
                    >
                      <option value="">Any Difficulty</option>
                      <option value="Easy">Easy (Beginner-friendly)</option>
                      <option value="Medium">Medium (Some experience)</option>
                      <option value="Hard">Hard (Advanced skills)</option>
                      <option value="Expert">Expert (Professional level)</option>
                    </select>
                  </div>

                  {/* Max Cooking Time */}
                  <div className="group">
                    <label htmlFor="max_cooking_time" className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Cooking Time
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="max_cooking_time"
                        id="max_cooking_time"
                        value={preferences.max_cooking_time || ''}
                        onChange={handlePreferenceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-gray-400"
                        min="1"
                        max="240"
                        placeholder="Optional time limit"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  {/* Meal Types */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Meal Types to Include
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Breakfast', 'Lunch', 'Dinner'].map(mealType => (
                        <label
                          key={mealType}
                          className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                            preferences.meal_types.includes(mealType)
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            id={mealType}
                            name="meal_types"
                            type="checkbox"
                            value={mealType}
                            checked={preferences.meal_types.includes(mealType)}
                            onChange={handleMealTypeChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            preferences.meal_types.includes(mealType)
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-gray-300'
                          }`}>
                            {preferences.meal_types.includes(mealType) && (
                              <CheckCircleIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={`font-medium ${
                            preferences.meal_types.includes(mealType)
                              ? 'text-indigo-900'
                              : 'text-gray-700'
                          }`}>
                            {mealType}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={generateMealPlan}
                  disabled={loading || preferences.meal_types.length === 0}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span className="text-lg">Generating Your Perfect Meal Plan...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <AutoAwesomeIcon className="mr-3" fontSize="large" />
                      <span className="text-lg">Generate AI Meal Plan</span>
                    </div>
                  )}
                </button>
                {preferences.meal_types.length === 0 && (
                  <p className="text-red-500 text-sm mt-2 text-center">Please select at least one meal type</p>
                )}
              </div>
            </div>
          </div>

          {/* Meal Plan Display */}
          {mealPlan && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden mb-10 border border-gray-100">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
                <div className="flex items-center gap-3">
                  <CalendarMonthIcon className="text-white" fontSize="large" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Meal Plan</h2>
                    <p className="text-amber-100 mt-1">
                      {formatDate(mealPlan.start_date)} to {formatDate(mealPlan.end_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {Object.entries(
                    mealPlan.entries.reduce((acc, entry) => {
                      if (!entry.date) return acc; // Skip entries without a date
                      const date = entry.date.split('T')[0];
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(entry);
                      return acc;
                    }, {} as Record<string, MealPlanEntry[]>)
                  ).map(([date, entries]) => (
                    <div key={date} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        {formatDate(date)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.map(entry => (
                          <div
                            key={entry.id}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                          >
                            {entry.recipe.image ? (
                              <div className="h-48 overflow-hidden">
                                <img
                                  src={entry.recipe.image}
                                  alt={entry.recipe.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <RestaurantMenuIcon className="text-gray-400" fontSize="large" />
                              </div>
                            )}
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getMealTypeColor(entry.meal_type)}`}>
                                  {entry.meal_type}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditClick(entry)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="Edit meal"
                                  >
                                    <EditIcon fontSize="small" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(entry)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Delete meal"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-200">
                                {entry.recipe.title}
                              </h4>
                            </div>
                          </div>
                            ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Shopping List Display */}
          {shoppingList && shoppingList.ingredients.length > 0 && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 px-8 py-6">
                <div className="flex items-center gap-3">
                  <ShoppingCartIcon className="text-white" fontSize="large" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Shopping List</h2>
                    <p className="text-green-100 mt-1">Everything you need for your meal plan</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shoppingList.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-4 flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editEntry} onClose={() => setEditEntry(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Meal Entry</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-4">
            <TextField
              select
              label="Meal Type"
              name="meal_type"
              value={editForm.meal_type}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            >
              {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Recipe Title"
              name="recipe_title"
              value={editForm.recipe_title}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              disabled
              helperText="Recipe title cannot be changed. You can only modify the meal type."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEntry(null)}>Cancel</Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            disabled={editLoading}
            sx={{ 
              background: 'linear-gradient(45deg, #f59e0b, #ea580c)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d97706, #dc2626)',
              }
            }}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteEntry} onClose={() => setDeleteEntry(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Meal Entry</DialogTitle>
        <DialogContent>
          <div className="flex items-center gap-3 py-4">
            <ErrorOutlineIcon className="text-red-500" fontSize="large" />
            <div>
              <p className="text-gray-800 font-medium">
                Are you sure you want to delete this meal entry?
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {deleteEntry?.recipe.title} - {deleteEntry?.meal_type}
              </p>
              <p className="text-red-600 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEntry(null)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </UserDashboardLayout>
  );
};

export default UserMealPlannerPage;