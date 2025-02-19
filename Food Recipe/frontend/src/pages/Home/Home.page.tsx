import foodImg2 from "../../assets/images/pngegg (2).png";
import categoryImg from "../../assets/images/pngegg (2).png"; // Add images for categories
import { FaHeart, FaStar, FaShareAlt } from "react-icons/fa";
import HeroSection from "../../components/Hero.components";
import CategoryCarousel from "../../components/Carousel";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Search, Favorite, TrendingUp, Restaurant, AccessTime } from '@mui/icons-material';
import FeaturedRecipes from "../../components/FeaturedRecipe";
import TestimonialSection from "../../components/Testimonials";
import VideoSection from "../../components/Video";
import NewsletterSignup from "../../components/Newsletter";
import TitleText from "../../components/TitleText";
const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      {/* <div className="relative w-full bg-white"> */}
        {/* Navbar */}
        

        {/* Hero Section */}
        <HeroSection />

        {/* Main Content */}
      
        {/* Categories Section */}
        <section className="mb-16 mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12">
          <div className="text-center my-10">
            <TitleText title="Choose a Category" />

            <Typography variant="h6" className="text-lg text-gray-700 mt-2">
              Recipe Categories
            </Typography>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CategoryCarousel />
          </motion.div>
        </section>


        {/* Popular Recipes Section */}
      {/* Popular Recipes Section */}
    <section className="bg-gray-100">
      <section className="mb-0 mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 py-10">
        <div className="mb-7 text-center">
          <TitleText title="Featured Recipe" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <FeaturedRecipes />
        </motion.div>

        {/* Centered Button */}
        <div className="flex justify-center mt-8">
          <button className="bg-amber-600 text-white font-semibold text-sm sm:text-lg px-6 py-3 rounded-full shadow-md transition-all duration-300 hover:bg-amber-700 hover:scale-105">
            View All Recipes
          </button>
        </div>
      </section>
    </section>

        {/* Video Section */}
        <VideoSection />

        <NewsletterSignup />
        {/* Testimonials */}
        <TestimonialSection />

        

      
      {/* </div> */}
    </motion.div>
  );
};

export default Home;