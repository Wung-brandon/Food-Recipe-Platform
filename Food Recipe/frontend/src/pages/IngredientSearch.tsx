import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserDashboardLayout from '../Layout/UserDashboardLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Recipe {
  id: number;
  title: string;
  image?: string;
  slug: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  average_rating?: number;
}

interface SearchResult {
  recipes: Recipe[];
  ai_suggestions: string[];
  total_found: number;
}

interface SearchHistory {
  id: number;
  ingredients: string[];
  results_count: number;
  search_timestamp: string;
}

const API_BASE_URL = 'http://localhost:8000';

const IngredientSearch: React.FC = () => {
  const [ingredients, setIngredients] = useState<string>('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const { token } = useAuth();

  // Common ingredients for quick selection
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'eggs', 'rice', 'pasta', 'potatoes',
    'onion', 'garlic', 'tomatoes', 'carrots', 'bell peppers', 'mushrooms',
    'cheese', 'milk', 'butter', 'olive oil', 'salt', 'pepper', 'herbs',
    'bread', 'flour', 'sugar', 'lemon', 'ginger', 'soy sauce'
  ];

  useEffect(() => {
    if (token) {
      fetchSearchHistory();
    }
  }, [token]);

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/ai/ingredient-search/history/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setSearchHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch search history:', err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResult(null);

    // Combine typed ingredients with selected ingredients
    const allIngredients = [
      ...ingredients.split(',').map(item => item.trim()).filter(item => item !== ''),
      ...selectedIngredients
    ];

    // Remove duplicates
    const uniqueIngredients = [...new Set(allIngredients)];

    if (uniqueIngredients.length === 0) {
      setError('Please enter or select at least one ingredient.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/ai/ingredient-search/`, {
        params: {
          ingredients: uniqueIngredients.join(','),
          max_results: 12
        }
      });
      
      setSearchResult(response.data);
      console.log('Search Result:', response.data);
      
      // Refresh search history if user is authenticated
      if (token) {
        fetchSearchHistory();
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Error fetching recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const removeSelectedIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(item => item !== ingredient));
  };

  const clearAll = () => {
    setIngredients('');
    setSelectedIngredients([]);
    setSearchResult(null);
    setError(null);
  };

  const handleHistorySearch = (historyItem: SearchHistory) => {
    setSelectedIngredients(historyItem.ingredients);
    setIngredients('');
    setShowHistory(false);
    handleSearch();
  };

  const getCurrentIngredients = () => {
    const typed = ingredients.split(',').map(item => item.trim()).filter(item => item !== '');
    return [...new Set([...typed, ...selectedIngredients])];
  };

  return (
    <UserDashboardLayout title="Ingredient Based Search">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Recipes by Ingredients</h2>
          <p className="text-gray-600 mb-6">
            Enter the ingredients you have available, and our AI will suggest recipes you can make.
          </p>

          {/* Search Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type ingredients (comma-separated):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., chicken, onion, garlic"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Selected Ingredients Display */}
            {selectedIngredients.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected ingredients:
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map(ingredient => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
                    >
                      {ingredient}
                      <button
                        onClick={() => removeSelectedIngredient(ingredient)}
                        className="ml-2 text-amber-600 hover:text-amber-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Select Ingredients */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick select common ingredients:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {commonIngredients.map(ingredient => (
                  <button
                    key={ingredient}
                    onClick={() => toggleIngredient(ingredient)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      selectedIngredients.includes(ingredient)
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {getCurrentIngredients().length > 0 && (
                  <span>
                    Ready to search with: {getCurrentIngredients().join(', ')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {token && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-4 py-2 text-amber-600 border border-amber-600 rounded-md hover:bg-amber-50"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  disabled={loading || getCurrentIngredients().length === 0}
                  className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search Recipes'}
                </button>
              </div>
            </div>
          </div>

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {searchHistory.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleHistorySearch(item)}
                  >
                    <div>
                      <span className="font-medium">{item.ingredients.join(', ')}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({item.results_count} results)
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(item.search_timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <span className="ml-4 text-lg">Finding recipes for you...</span>
          </div>
        )}

        {/* Search Results */}
        {searchResult && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                Found {searchResult.total_found} Recipe{searchResult.total_found !== 1 ? 's' : ''}
              </h3>
              {searchResult.total_found > 0 && (
                <span className="text-sm text-gray-600">
                  Showing recipes you can make with your ingredients
                </span>
              )}
            </div>

            {/* AI Suggestions */}
            {searchResult.ai_suggestions && searchResult.ai_suggestions.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">💡 AI Suggestions</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Consider adding these ingredients to expand your recipe options:
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchResult.ai_suggestions.map((suggestion, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md cursor-pointer hover:bg-blue-200"
                      onClick={() => toggleIngredient(suggestion)}
                    >
                      + {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Results */}
            {searchResult.recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResult.recipes.map(recipe => (
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
                        {recipe.servings && (
                          <span>Serves: {recipe.servings}</span>
                        )}
                      </div>
                      
                      {typeof recipe.average_rating === "number" && !isNaN(recipe.average_rating) && recipe.average_rating > 0 && (
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
                        className="block w-full text-center bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
                      >
                        View Recipe
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any recipes with the ingredients you selected. Try adding more ingredients or different combinations.
                </p>
                {searchResult.ai_suggestions && searchResult.ai_suggestions.length > 0 && (
                  <p className="text-sm text-gray-600">
                    💡 Check out the AI suggestions above for ingredients that might help!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default IngredientSearch;