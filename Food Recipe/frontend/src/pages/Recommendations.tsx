import { useState, useEffect } from "react";
import axios from "axios";
import UserDashboardLayout from "../Layout/UserDashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Recipe {
  id: number;
  title: string;
  image?: string | null;
  slug: string;
  average_rating?: number;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
}

interface UserPreferences {
  dietary_needs: string[];
  cuisine_preferences: string[];
  disliked_ingredients: string[];
  cooking_skill_level: string;
  preferred_cooking_time: number;
}

const API_BASE_URL = 'http://localhost:8000';

const RecommendedRecipes: React.FC = () => {
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [updatingPreferences, setUpdatingPreferences] = useState<boolean>(false);

  const { token } = useAuth();

  // Dietary options
  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 
    'low-carb', 'dairy-free', 'nut-free'
  ];

  // Cuisine options
  const cuisineOptions = [
    'Central African', 'East African', 'Central African', 'North African',
    'West African', 'South African', 'Traditional African'
  ];

  useEffect(() => {
    if (token) {
      fetchUserPreferences();
      fetchRecommendedRecipes();
    }
  }, [token]);

  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/ai/recommendations/preferences/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setPreferences(response.data);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const fetchRecommendedRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/ai/recommendations/?limit=12`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      setRecommendedRecipes(response.data);
      console.log('Fetched Recommended Recipes:', response.data);
    } catch (err: any) {
      console.error('Failed to fetch recommended recipes:', err);
      setError(err.response?.data?.error || 'Failed to fetch recommended recipes.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updatedPrefs: UserPreferences) => {
    try {
      setUpdatingPreferences(true);
      
      await axios.post(
        `${API_BASE_URL}/api/ai/recommendations/preferences/`,
        updatedPrefs,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      setPreferences(updatedPrefs);
      setShowPreferencesModal(false);
      
      // Refresh recommendations after updating preferences
      fetchRecommendedRecipes();
    } catch (err) {
      console.error('Failed to update preferences:', err);
      alert('Failed to update preferences. Please try again.');
    } finally {
      setUpdatingPreferences(false);
    }
  };

  const trackRecipeView = async (recipeId: number) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/ai/recommendations/track-view/${recipeId}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error('Failed to track recipe view:', err);
    }
  };

  const handlePreferenceChange = (
    field: keyof UserPreferences, 
    value: string | number | string[]
  ) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [field]: value
      });
    }
  };

  const toggleArrayPreference = (field: 'dietary_needs' | 'cuisine_preferences' | 'disliked_ingredients', value: string) => {
    if (preferences) {
      const currentArray = preferences[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      setPreferences({
        ...preferences,
        [field]: newArray
      });
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout title="Recommended Recipes">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <span className="ml-4 text-lg">Getting your personalized recommendations...</span>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error) {
    return (
      <UserDashboardLayout title="Recommended Recipes">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={fetchRecommendedRecipes}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
          >
            Try Again
          </button>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout title="Recommended Recipes">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-gray-800">AI-Powered Recommendations</h3>
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
          >
            Update Preferences
          </button>
        </div>
        
        {preferences && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-2">Your Current Preferences:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {preferences.dietary_needs.length > 0 && (
                <div>
                  <span className="font-medium">Dietary:</span> {preferences.dietary_needs.join(', ')}
                </div>
              )}
              {preferences.cuisine_preferences.length > 0 && (
                <div>
                  <span className="font-medium">Cuisines:</span> {preferences.cuisine_preferences.join(', ')}
                </div>
              )}
              <div>
                <span className="font-medium">Skill Level:</span> {preferences.cooking_skill_level}
              </div>
            </div>
          </div>
        )}
      </div>

      {recommendedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No recommendations available yet.</p>
          <p className="text-sm text-gray-500">Browse some recipes to help us learn your preferences!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={recipe.image || "https://placehold.co/300x200?text=No+Image"}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h4>
                
                {recipe.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
                )}
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  {recipe.prep_time && (
                    <span>Prep: {recipe.prep_time}min</span>
                  )}
                  {recipe.cook_time && (
                    <span>Cook: {recipe.cook_time}min</span>
                  )}
                </div>
                
                {typeof recipe.average_rating === "number" && !isNaN(recipe.average_rating) && (
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(recipe.average_rating!) ? "★" : "☆"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {recipe.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                
                <Link
                  to={`/recipe/${recipe.slug}`}
                  onClick={() => trackRecipeView(recipe.id)}
                  className="block w-full text-center bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors"
                >
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferencesModal && preferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Update Your Preferences</h3>
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Dietary Needs */}
                <div>
                  <h4 className="font-semibold mb-3">Dietary Requirements</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.dietary_needs.includes(option)}
                          onChange={() => toggleArrayPreference('dietary_needs', option)}
                          className="mr-2"
                        />
                        <span className="capitalize">{option.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cuisine Preferences */}
                <div>
                  <h4 className="font-semibold mb-3">Preferred Cuisines</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {cuisineOptions.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={preferences.cuisine_preferences.includes(option)}
                          onChange={() => toggleArrayPreference('cuisine_preferences', option)}
                          className="mr-2"
                        />
                        <span className="capitalize">{option.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cooking Skill Level */}
                <div>
                  <h4 className="font-semibold mb-3">Cooking Skill Level</h4>
                  <select
                    value={preferences.cooking_skill_level}
                    onChange={(e) => handlePreferenceChange('cooking_skill_level', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Preferred Cooking Time */}
                <div>
                  <h4 className="font-semibold mb-3">Preferred Cooking Time (minutes)</h4>
                  <input
                    type="number"
                    value={preferences.preferred_cooking_time}
                    onChange={(e) => handlePreferenceChange('preferred_cooking_time', parseInt(e.target.value))}
                    className="w-full p-2 border rounded-md"
                    min="5"
                    max="300"
                  />
                </div>

                {/* Disliked Ingredients */}
                <div>
                  <h4 className="font-semibold mb-3">Ingredients to Avoid</h4>
                  <input
                    type="text"
                    placeholder="Enter ingredients separated by commas"
                    value={preferences.disliked_ingredients.join(', ')}
                    onChange={(e) => handlePreferenceChange('disliked_ingredients', 
                      e.target.value.split(',').map(s => s.trim()).filter(s => s)
                    )}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                  disabled={updatingPreferences}
                >
                  Cancel
                </button>
                <button
                  onClick={() => updatePreferences(preferences)}
                  disabled={updatingPreferences}
                  className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
                >
                  {updatingPreferences ? 'Updating...' : 'Update Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};

export default RecommendedRecipes;