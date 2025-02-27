import React from 'react';
import { motion } from 'framer-motion';
import RecipeCard from './RecipeCard';
import RecipeData from '../types/Recipe';
import { 
    spaghetti,
    ekwang,
    katikati,
    pizza,
    ndole,
    achu,
    oslun,
    pepperBeef
 } from './images';
// Static Data
const recipes:RecipeData[] = [
  {
    id: 1,
    title: "Jollof Rice",
    category: "Desserts",
    imageUrl: spaghetti,
    cookTime: 45,
    difficulty: "Medium",
    rating: 4.5,
    reviewCount: 120,
    author: {
      name: "Chef Aisha",
      avatarUrl: spaghetti
    },
    isSaved: false,
    isLiked: false,
    likeCount: 50,
    createdAt: "2023-01-15"
  },
  {
    id: 2,
    title: "Sushi",
    imageUrl: ekwang,
    category: "Desserts",
    cookTime: 30,
    difficulty: "Hard",
    rating: 4.8,
    reviewCount: 200,
    author: {
      name: "Chef Kenji",
      avatarUrl: ekwang
    },
    isSaved: true,
    isLiked: true,
    likeCount: 150,
    createdAt: "2023-02-10"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    imageUrl: ndole,
    category: "Desserts",
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: ndole
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
  {
    id: 4,
    title: "Tacos",
    imageUrl: achu,
    category: "Desserts",
    cookTime: 15,
    difficulty: "Easy",
    rating: 4.7,
    reviewCount: 150,
    author: {
      name: "Chef Juan",
      avatarUrl: achu
    },
    isSaved: true,
    isLiked: true,
    likeCount: 100,
    createdAt: "2023-03-20"
  },
  {
    id: 2,
    title: "Sushi",
    imageUrl: pizza,
    category: "Desserts",
    cookTime: 30,
    difficulty: "Hard",
    rating: 4.8,
    reviewCount: 200,
    author: {
      name: "Chef Kenji",
      avatarUrl: pizza
    },
    isSaved: true,
    isLiked: true,
    likeCount: 150,
    createdAt: "2023-02-10"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    category: "Desserts",
    imageUrl: oslun,
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: oslun
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
  {
    id: 4,
    title: "Tacos",
    imageUrl: katikati,
    category: "Desserts",
    cookTime: 15,
    difficulty: "Easy",
    rating: 4.7,
    reviewCount: 150,
    author: {
      name: "Chef Juan",
      avatarUrl: katikati
    },
    isSaved: true,
    isLiked: true,
    likeCount: 100,
    createdAt: "2023-03-20"
  },
  {
    id: 3,
    title: "Pasta Primavera",
    category: "Desserts",
    imageUrl: pepperBeef,
    cookTime: 25,
    difficulty: "Easy",
    rating: 4.2,
    reviewCount: 90,
    author: {
      name: "Chef Maria",
      avatarUrl: pepperBeef
    },
    isSaved: false,
    isLiked: false,
    likeCount: 30,
    createdAt: "2023-03-05"
  },
];

const FeaturedRecipes: React.FC = () => {
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

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {recipes.map((recipe) => (
        <motion.div key={recipe.id} variants={item} whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <RecipeCard recipe={recipe} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeaturedRecipes;