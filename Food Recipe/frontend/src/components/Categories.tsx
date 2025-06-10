import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard';
import CategoryData from '../types/Category';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  spaghetti,
  chicken,
  beans,
  delicious,
  plantain,
} from './images';

const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  categories: `${API_BASE_URL}/api/categories/`,
};

const fallbackImages = [spaghetti, beans, chicken, plantain, delicious];

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.categories);
        // Map API data to include imageUrl and colors if needed
        const apiCategories = (response.data.results || response.data).map((cat: any, idx: number) => ({
          id: cat.id,
          slug: cat.slug, // <-- store slug
          name: cat.name,
          recipeCount: cat.recipe_count || 0,
          imageUrl: fallbackImages[idx % fallbackImages.length],
          colorStart: 'from-yellow-100',
          colorEnd: 'to-orange-200'
        }));
        console.log('Fetched Categories:', apiCategories.map(cat => cat.name));
        setCategories(apiCategories);
      } catch (error) {
        // Fallback to hardcoded categories
        setCategories([
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
        ]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => (
          <Link to={`/category/${category.slug}`} key={category.slug}>
            <motion.div
              key={category.slug}
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