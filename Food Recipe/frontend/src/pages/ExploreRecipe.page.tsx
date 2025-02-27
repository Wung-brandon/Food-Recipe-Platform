import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Restaurant, 
  Cake, 
  FreeBreakfast, 
  Fastfood, 
  LocalPizza, // Changed from Bakery to LocalPizza which exists
  KeyboardArrowDown
} from '@mui/icons-material';
import { 
  InputAdornment, 
  TextField, 
  Avatar,
 } from '@mui/material';

import { 
  spaghetti, 
  ekwang, 
  ndole, 
  achu, 
  pizza, 
  pepperBeef,
  chef
 } from "../components/images";
import RecipeCard from '../components/RecipeCard';
// Sample image imports (replace with your actual imports)
const sampleImage = "/api/placeholder/300/200";

// Sample recipe data
const recipeData = [
  {
    id: 1,
    title: "Mushroom Risotto",
    category: "Vegetarian",
    imageUrl: spaghetti,
    cookTime: 45,
    difficulty: "Medium",
    rating: 4.7,
    reviewCount: 128,
    author: {
      name: "Chef Alex",
      avatarUrl: spaghetti
    },
    isSaved: true,
    isLiked: true,
    likeCount: 87,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Blueberry Pancakes",
    category: "Breakfast",
    imageUrl: ekwang,
    cookTime: 20,
    difficulty: "Easy",
    rating: 4.9,
    reviewCount: 203,
    author: {
      name: "Jamie Wilson",
      avatarUrl: ekwang
    },
    isSaved: false,
    isLiked: true,
    likeCount: 142,
    createdAt: "2024-02-10"
  },
  {
    id: 3,
    title: "Chocolate Soufflé",
    category: "Desserts",
    imageUrl: pepperBeef,
    cookTime: 60,
    difficulty: "Hard",
    rating: 4.5,
    reviewCount: 76,
    author: {
      name: "Pastry Master",
      avatarUrl: pepperBeef
    },
    isSaved: true,
    isLiked: false,
    likeCount: 53,
    createdAt: "2024-01-28"
  },
  {
    id: 4,
    title: "Avocado Toast",
    category: "Breakfast",
    imageUrl: ndole,
    cookTime: 10,
    difficulty: "Easy",
    rating: 4.3,
    reviewCount: 182,
    author: {
      name: "Health Guru",
      avatarUrl: ndole
    },
    isSaved: false,
    isLiked: false,
    likeCount: 94,
    createdAt: "2024-02-22"
  },
  {
    id: 5,
    title: "Homemade Sourdough",
    category: "Baked Food",
    imageUrl: achu,
    cookTime: 180,
    difficulty: "Hard",
    rating: 4.8,
    reviewCount: 156,
    author: {
      name: "Bread Master",
      avatarUrl: achu
    },
    isSaved: true,
    isLiked: true,
    likeCount: 112,
    createdAt: "2024-01-05"
  },
  {
    id: 6,
    title: "Garden Salad",
    category: "Vegetarian",
    imageUrl: pizza,
    cookTime: 15,
    difficulty: "Easy",
    rating: 4.1,
    reviewCount: 89,
    author: {
      name: "Fresh Foodie",
      avatarUrl: pizza
    },
    isSaved: false,
    isLiked: true,
    likeCount: 67,
    createdAt: "2024-02-18"
  },
];

// Define most followed chefs
const topChefs = [
  {
    name: "Sophia Chen",
    location: "San Francisco, USA",
    avatarUrl: chef
  },
  {
    name: "Marco Rossi",
    location: "Rome, Italy",
    avatarUrl: chef
  },
  {
    name: "Aisha Patel",
    location: "Mumbai, India",
    avatarUrl: chef
  },
  {
    name: "Carlos Rivera",
    location: "Mexico City, Mexico",
    avatarUrl: chef
  }
];

// Recipe Card Component


// Main Component
const ExploreRecipesPage: React.FC = () => {  // Changed component name to match file name
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState(recipeData);
  
  const categories = [
    { id: "ALL", label: "All", icon: <Restaurant /> },
    { id: "Vegetarian", label: "Vegetarian", icon: <Restaurant /> },
    { id: "Desserts", label: "Desserts", icon: <Cake /> },
    { id: "Breakfast", label: "Breakfast", icon: <FreeBreakfast /> },
    { id: "Lunch", label: "Lunch", icon: <Fastfood /> },
    { id: "Baked Food", label: "Baked Food", icon: <LocalPizza /> },  // Changed to LocalPizza
  ];
  
  useEffect(() => {
    let result = recipeData;
    
    // Filter by category
    if (activeCategory !== "ALL") {
      result = result.filter(recipe => recipe.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(recipe => 
        recipe.title.toLowerCase().includes(query) || 
        recipe.author.name.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecipes(result);
  }, [activeCategory, searchQuery]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Amber Overlay */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 to-amber-800/70 z-10"></div>
        <div className="h-64 bg-cover bg-center" style={{ backgroundImage: `url(${sampleImage})` }}></div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Explore Recipes</h1>
            <p className="text-amber-100 max-w-lg mx-auto">
              Discover delicious recipes from around the world
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <TextField
            fullWidth
            placeholder="Search recipes, chefs, or ingredients..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-amber-600" />
                </InputAdornment>
              ),
              className: "bg-white rounded-full shadow-sm",
            }}
          />
        </motion.div>
        
        {/* Categories */}
        <motion.div 
          className="mb-10 overflow-x-auto hide-scrollbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex space-x-2 pb-2">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  ${activeCategory === category.id 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 hover:bg-amber-100'}`}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Recipes Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <motion.h2 
                className="text-2xl font-bold text-gray-800"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                {activeCategory === "ALL" ? "All Recipes" : activeCategory}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <p className="text-gray-500 text-sm">
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
              
              {filteredRecipes.length === 0 && (
                <motion.div 
                  className="col-span-full py-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg text-gray-500">No recipes found matching your criteria</p>
                  <button 
                    className="mt-4 px-5 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
                    onClick={() => {
                      setActiveCategory("ALL");
                      setSearchQuery("");
                    }}
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/4">
            {/* Most Followed */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-5 mb-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Most followed</h3>
                <button className="text-amber-600 text-sm hover:underline">
                  VIEW ALL
                </button>
              </div>
              
              <div className="space-y-4">
                {topChefs.map((chef, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 * index + 0.7 }}
                    whileHover={{ x: 5 }}
                  >
                    <Avatar src={chef.avatarUrl} alt={chef.name} />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{chef.name}</p>
                      <p className="text-xs text-gray-500">{chef.location}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* I'd like to cook */}
            <motion.div 
              className="bg-white rounded-xl shadow-md p-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">I'd like to cook...</h3>
                <button className="text-amber-600 text-sm hover:underline">
                  VIEW ALL
                </button>
              </div>
              
              <div className="space-y-2">
                {["Vegetarian", "Dessert", "Quick meals", "Protein-rich", "Dairy-free"].map((preference, index) => (
                  <motion.button
                    key={preference}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-gray-700 flex justify-between items-center"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 * index + 0.9 }}
                  >
                    {preference}
                    <KeyboardArrowDown className="text-gray-400" fontSize="small" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Custom CSS for hiding scrollbar */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ExploreRecipesPage;