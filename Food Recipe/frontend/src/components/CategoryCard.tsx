import React from 'react'
import CategoryData from '../types/Category'
import { Card, Typography } from '@mui/material';

const CategoryCard:React.FC<{category: CategoryData}> = ({ category }) => {
  return (
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
  )
}

export default CategoryCard