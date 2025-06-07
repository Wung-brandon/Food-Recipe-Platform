import React, { useState } from 'react';
import axios from 'axios';
import UserDashboardLayout from '../Layout/UserDashboardLayout';

interface Recipe {
  id: number;
  title: string;
  image?: string;
  // Add other fields you want to display
}

const IngredientSearch: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setRecipes([]); // Clear previous results

    const ingredientList = ingredients.split(',').map(item => item.trim()).filter(item => item !== '');

    if (ingredientList.length === 0) {
      setError('Please enter at least one ingredient.');
      setLoading(false);
      return;
    }

    try {
      // Adjust the URL to your backend ingredient search endpoint
      const response = await axios.get('http://127.0.0.1:8000/api/ingredient-search/', {
        params: {
          ingredients: ingredientList.join(',')
        }
      });
      setRecipes(response.data); // Assuming your API returns an array of recipes
    } catch (err) {
      setError('Error fetching recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserDashboardLayout title="Ingredient Based Search">
      <h2>Ingredient Based Search</h2>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (comma-separated)"
          style={{ marginRight: '10px', padding: '8px', width: '70%' }}
        />
        <button onClick={handleSearch} disabled={loading} style={{ padding: '8px 15px' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recipes.length > 0 && (
        <div>
          <h3>Matching Recipes:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {recipes.map(recipe => (
              <div key={recipe.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                {recipe.image && <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '10px' }} />}
                <h4>{recipe.title}</h4>
                {/* Add link to recipe details if needed */}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && recipes.length === 0 && ingredients.length > 0 && (
        <p>No recipes found with the given ingredients.</p>
      )}
    </UserDashboardLayout>
  );
};

export default IngredientSearch;