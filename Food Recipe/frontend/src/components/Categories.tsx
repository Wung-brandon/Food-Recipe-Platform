import React from 'react';
import { motion } from 'framer-motion';
// import { Card, Typography } from '@mui/material';
import CategoryCard from './CategoryCard';
import CategoryData from '../types/Category';
import { 
  spaghetti,
  chicken,
  beans,
  delicious,
  plantain, } from './images';
  import { Link } from 'react-router-dom';


const categories: CategoryData[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    recipeCount: 120,
    imageUrl: spaghetti,
    colorStart: 'from-yellow-100',
    colorEnd: 'to-orange-200'
  },
  {
    id: 'lunch',
    name: 'Lunch',
    recipeCount: 150,
    imageUrl: beans,
    colorStart: 'from-green-100',
    colorEnd: 'to-teal-200'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    recipeCount: 95,
    imageUrl: chicken,
    colorStart: 'from-pink-100',
    colorEnd: 'to-rose-200'
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    recipeCount: 110,
    imageUrl: plantain,
    colorStart: 'from-green-200',
    colorEnd: 'to-lime-300'
  },
  {
    id: 'baked',
    name: 'Baked Foods',
    recipeCount: 80,
    imageUrl: delicious,
    colorStart: 'from-orange-100',
    colorEnd: 'to-yellow-200'
  }
];

const CategoryList: React.FC = () => {
  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <Link to={`/category/${category.id}`} key={category.id}>
            <motion.div 
              key={category.id}
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <CategoryCard category={category} />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;