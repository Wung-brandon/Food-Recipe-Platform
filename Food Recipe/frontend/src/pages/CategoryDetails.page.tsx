import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typography, Rating, Chip, Pagination, Skeleton } from '@mui/material';
import { AccessTime, RestaurantMenu, Bookmark, BookmarkBorder } from '@mui/icons-material';
import TitleText from "../components/TitleText";
import RecipeCard from '../components/RecipeCard';
import { 
    spaghetti,
    chicken,
    beans,
    delicious,
    plantain, } from '../components/images';
// Types
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

const CategoryDetails: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const recipesPerPage = 6;

  // Mock data - in a real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const categoryData = {
        breakfast: {
          id: 'breakfast',
          name: 'Breakfast',
          description: 'Start your day with these nutritious and delicious breakfast recipes that will fuel your morning and keep you energized throughout the day.',
          image: spaghetti
        },
        lunch: {
          id: 'lunch',
          name: 'Lunch',
          description: 'Quick, satisfying midday meals perfect for busy schedules. Our lunch recipes offer a perfect balance of nutrition and flavor.',
          image: chicken
        },
        baked: {
          id: 'baked',
          name: 'Baked Foods',
          description: 'From crusty artisan breads to delectable pastries, our baked goods recipes bring the warmth and aroma of a professional bakery to your home.',
          image: beans
        },
        desserts: {
          id: 'desserts',
          name: 'Desserts',
          description: 'Indulge your sweet tooth with our collection of dessert recipes, from quick and easy treats to impressive showstoppers.',
          image: delicious
        },
        vegetarian: {
          id: 'vegetarian',
          name: 'Vegetarian',
          description: 'Flavorful vegetarian dishes that prove meat-free meals can be satisfying, nutritious, and incredibly delicious.',
          image: plantain
        },
      };

      const mockRecipes = Array(12).fill(null).map((_, index) => ({
        id: `recipe-${categoryId}-${index}`,
        title: `${categoryData[categoryId as keyof typeof categoryData]?.name} Recipe ${index + 1}`,
        imageUrl: category?.image || '/api/placeholder/400/300', // Changed from image to imageUrl
        cookTime: Math.floor(Math.random() * 50) + 10,
        difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
        rating: Math.floor(Math.random() * 5) + 1,
        category: categoryId || '',
        isLiked: Math.random() > 0.7, // Changed from isFavorite to isLiked
        isSaved: Math.random() > 0.7, // Added this property
        likeCount: Math.floor(Math.random() * 100),
        reviewCount: Math.floor(Math.random() * 50),
        author: {
          name: "Chef " + (index + 1),
          avatarUrl: "/api/placeholder/50/50"
        }
      }));

      // Get all categories except current one
      const allCategories = Object.values(categoryData);
      const related = allCategories.filter(cat => cat.id !== categoryId);
      
      setCategory(categoryData[categoryId as keyof typeof categoryData] || null);
      setRecipes(mockRecipes);
      setRelatedCategories(related);
      setLoading(false);
    }, 1200);
  }, [categoryId]);

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
                <RecipeCard recipe={recipe} />
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
                onClick={() => navigate(`/category/${relatedCategory.id}`)}
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