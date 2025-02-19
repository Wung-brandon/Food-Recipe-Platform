import React from 'react';
import { motion } from 'framer-motion';
import { Card, Typography } from '@mui/material';
import { 
  spaghetti,
  chicken,
  beans,
  delicious,
  plantain, } from './images';

interface Category {
  id: string;
  name: string;
  recipeCount: number;
  imageUrl?: string;
  colorStart?: string;
  colorEnd?: string;
}

const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Breakfast',
    recipeCount: 120,
    imageUrl: spaghetti,
    colorStart: 'from-yellow-100',
    colorEnd: 'to-orange-200'
  },
  {
    id: 'cat-2',
    name: 'Lunch',
    recipeCount: 150,
    imageUrl: beans,
    colorStart: 'from-green-100',
    colorEnd: 'to-teal-200'
  },
  {
    id: 'cat-3',
    name: 'Desserts',
    recipeCount: 95,
    imageUrl: chicken,
    colorStart: 'from-pink-100',
    colorEnd: 'to-rose-200'
  },
  {
    id: 'cat-4',
    name: 'Vegetarian',
    recipeCount: 110,
    imageUrl: plantain,
    colorStart: 'from-green-200',
    colorEnd: 'to-lime-300'
  },
  {
    id: 'cat-5',
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
          <motion.div 
            key={category.id}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Card 
              className="rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
              sx={{ 
                height: '300px', // Increased height
                background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                '--tw-gradient-from': category.colorStart?.replace('from-', '') || '#fef3c7',
                '--tw-gradient-to': category.colorEnd?.replace('to-', '') || '#fed7aa',
                '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to)'
              }}
            >
              <div className="relative h-full">
                <img
                  src={category.imageUrl || `/api/placeholder/240/200`}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 w-full p-2 bg-black/50">
                  <Typography 
                    variant="subtitle1" 
                    className="text-white font-medium transition-colors duration-300 hover:text-amber-600"
                  >
                    {category.name}
                  </Typography>
                  <Typography variant="caption" className="text-gray-200">
                    {category.recipeCount} recipes
                  </Typography>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;