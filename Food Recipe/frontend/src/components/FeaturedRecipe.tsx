import React from 'react';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import { useTranslation } from 'react-i18next';
import { RecipeData } from '../types/Recipe';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeaturedRecipes: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = React.useState<RecipeData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/recipes/');
        // Map API data to RecipeData type
        const apiRecipes = (response.data.results || response.data).map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category?.name || r.category || '',
          imageUrl: r.image || '',
          cookTime: r.preparation_time + r.cooking_time,
          difficulty: r.difficulty || '',
          rating: Number(r.average_rating) || 0,
          reviewCount: r.rating_count || 0,
          author: {
            name: r.author?.username || r.author?.name || 'Chef',
            avatarUrl: r.author?.profile_picture || '',
          },
          isSaved: r.is_favorited || false,
          isLiked: false,
          likeCount: r.like_count || 0,
          createdAt: r.created_at || '',
        }));
        setRecipes(apiRecipes);
      } catch (error) {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Loading...</div>;
  }

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {recipes.slice(0, 8).map((recipe) => (
          <motion.div key={recipe.id} variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <RecipeCard recipe={recipe} />
          </motion.div>
        ))}
      </motion.div>
      {/* {recipes.length > 8 && (
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-semibold"
            onClick={() => navigate('/explore-recipe')}
          >
            View All Recipes
          </button>
        </div>
      )} */}
    </>
  );
};

export default FeaturedRecipes;