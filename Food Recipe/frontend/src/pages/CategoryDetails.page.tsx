import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typography, Pagination, Skeleton } from '@mui/material';
import axios from 'axios';
import TitleText from "../components/TitleText";
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';
interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: number;
  difficulty: string;
  rating: number;
  category: string;
  isFavorite: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  categoryDetail: (slug: string) => `${API_BASE_URL}/api/categories/${slug}/`,
  recipesByCategory: (slug: string) => `${API_BASE_URL}/api/recipes/?category=${slug}`,
};

const CategoryDetails: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const recipesPerPage = 6;

  const { token } = useAuth();

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      try {
        if (!categoryId) {
          navigate('/not-found');
          return;
        }
        // Fetch category details
        const catRes = await axios.get(API_ENDPOINTS.categoryDetail(categoryId));
        setCategory({
          id: catRes.data.id || catRes.data.slug,
          name: catRes.data.name,
          description: catRes.data.description || '',
          image: catRes.data.image || '/api/placeholder/400/300',
        });

        // Fetch recipes for this category, with token if available
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const recRes = await axios.get(
          API_BASE_URL + `/api/recipes/?category=${categoryId}`,
          { headers }
        );
        setRecipes(
          (recRes.data.results || recRes.data).map((r: any) => ({
            id: r.id,
            title: r.title,
            imageUrl: r.image || '/api/placeholder/400/300',
            cookTime: r.cooking_time || 0,
            difficulty: r.difficulty || '',
            rating: r.rating || 0,
            category: r.category?.name || r.category || '',
            isLiked: r.is_liked || false,
            isSaved: r.is_saved || false,
            likeCount: r.likes || 0,
            reviewCount: r.review_count || 0,
            author: {
              name: r.chef_name || r.chef?.username || r.author?.username || 'Chef',
              avatarUrl: r.chef_avatar || r.chef?.avatar || '/api/placeholder/50/50',
            },
          }))
        );

        // Optionally fetch related categories (all except current)
        const allCatsRes = await axios.get(API_BASE_URL + '/api/categories/');
        setRelatedCategories(
          (allCatsRes.data.results || allCatsRes.data)
            .filter((cat: any) => (cat.slug || cat.id) !== categoryId)
            .map((cat: any) => ({
              id: cat.id || cat.slug,
              slug: cat.slug,
              name: cat.name,
              description: cat.description || '',
              image: cat.image || '/api/placeholder/400/300',
            }))
        );
      } catch (error) {
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId, navigate]);

  // Pagination logic
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginatedRecipes = recipes.slice(
    (page - 1) * recipesPerPage,
    page * recipesPerPage
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton variant="rectangular" height={300} className="mb-8 rounded-xl" />
        <Skeleton variant="text" height={80} className="mb-4" />
        <Skeleton variant="text" height={60} className="mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden shadow-lg">
              <Skeleton variant="rectangular" height={200} />
              <div className="p-4">
                <Skeleton variant="text" height={30} className="mb-2" />
                <Skeleton variant="text" height={20} className="mb-4" />
                <div className="flex justify-between">
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="circular" width={40} height={40} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    navigate('/not-found');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden"
    >
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Typography variant="h2" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {category.name} Recipes
            </Typography>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-4"></div>
            <Typography className="text-white max-w-3xl mx-auto">
              {category.description}
            </Typography>
          </motion.div>
        </div>
        <img 
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Recipes */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <TitleText title={`All ${category.name} Recipes`} />
            <Typography variant="body1" className="text-gray-600 mt-2">
              Discover our collection of {recipes.length} {category.name.toLowerCase()} recipes
            </Typography>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRecipes.map(recipe => (
                <div key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  currentUserId={null}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
                </div>
            ))}
            </div>
          

          {/* Pagination */}
          {recipes.length > recipesPerPage && (
            <div className="flex justify-center mt-12">
              <Pagination 
                count={Math.ceil(recipes.length / recipesPerPage)} 
                page={page}
                onChange={handlePageChange}
                color="primary"
                variant="outlined"
                shape="rounded"
              />
            </div>
          )}
        </section>

        {/* Related Categories */}
        <section>
          <div className="text-center mb-10">
            <TitleText title="Related Categories" />
            <Typography variant="body1" className="text-gray-600 mt-2">
              Explore other delicious recipe collections
            </Typography>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {relatedCategories.slice(0, 4).map(relatedCategory => (
              <motion.div
                key={relatedCategory.id}
                variants={itemVariants}
                className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/category/${relatedCategory.slug}`)}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 z-10 flex items-center justify-center">
                  <Typography variant="h6" className="text-white font-bold text-xl">
                    {relatedCategory.name}
                  </Typography>
                </div>
                <img 
                  src={relatedCategory.image}
                  alt={relatedCategory.name}
                  className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </motion.div>
  );
};

export default CategoryDetails;





