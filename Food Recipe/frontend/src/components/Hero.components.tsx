// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   Typography, 
//   Button, 
//   Container, 
//   useMediaQuery, 
//   useTheme
// } from '@mui/material';
// import { Search, ArrowForward, Favorite } from '@mui/icons-material';
// import StarIcon from '@mui/icons-material/Star';
// import { beans, plantain, delicious} from "./images"
// import SearchBar from './Searchbar';

// const HeroSection: React.FC = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const isTablet = useMediaQuery(theme.breakpoints.down('md'));
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     // Handle search logic
//     console.log(`Searching for: ${query}`);
//   };

//   return (
//     <div className="relative w-full overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100">
//       {/* Improved Background Elements */}
//       <div className="absolute inset-0 opacity-30">
//         <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
//           <defs>
//             <radialGradient id="hero-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
//             <stop offset="0%" stopColor="#D97706" stopOpacity="0.6" />
//             <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
//             </radialGradient>
//           </defs>
//           <rect width="100%" height="100%" fill="url(#hero-gradient)" />
//         </svg>
//       </div>

//       {/* Enhanced Decorative Elements */}
//       <motion.div
//         className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-r from-violet-200 to-fuchsia-200 opacity-60 blur-md"
//         animate={{
//           scale: [1, 1.2, 1],
//           opacity: [0.6, 0.8, 0.6],
//         }}
//         transition={{
//           duration: 8,
//           repeat: Infinity,
//           repeatType: "reverse"
//         }}
//       />
//       <motion.div
//         className="absolute top-32 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-amber-200 to-pink-200 opacity-50 blur-md"
//         animate={{
//           scale: [1, 1.1, 1],
//           opacity: [0.5, 0.7, 0.5],
//         }}
//         transition={{
//           duration: 10,
//           repeat: Infinity,
//           repeatType: "reverse"
//         }}
//       />

      
//         <div className="py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">
//           {/* Hero Text Content */}
//           <motion.div 
//             className="w-full md:w-7/12 lg:w-6/12 text-center md:text-left px-4 md:px-0"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7 }}
//           >
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.7 }}
//             >
//               <Typography 
//                 component="h1" 
//                 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 leading-tight"
//                 sx={{ fontSize: {xs: '2.5rem', sm: '3rem', md: '3.5rem', lg: '4rem'} }}
//               >
//                 Discover & Share 
//                 <span className="text-amber-500"> Delicious</span> Recipes
//               </Typography>
//             </motion.div>
            
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5, duration: 0.7 }}
//             >
//               <Typography 
//                 variant="h6" 
//                 component="p" 
//                 className="mb-8 text-gray-600 max-w-xl mx-auto md:mx-0"
//                 sx={{ fontSize: {xs: '1rem', md: '1.125rem'} }}
//               >
//                 Join our community of food lovers to find inspiration, share your culinary creations, and explore thousands of recipes from around the world. Whether you're a novice cook or a seasoned chef, there's something for everyone here.
//               </Typography>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.7, duration: 0.7 }}
//               className="mb-8"
//             >
//               <SearchBar onSearch={handleSearch} placeholder="Search for recipes, ingredients, or cuisines..." />
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.9, duration: 0.7 }}
//               className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
//             >
//               <Button 
//                 variant="contained" 
//                 size={isMobile ? "medium" : "large"}
//                 className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-full px-6 sm:px-8 py-2.5 sm:py-3 font-medium"
//                 endIcon={<ArrowForward />}
//               >
//                 Join Now
//               </Button>
//               <Button 
//                 variant="outlined" 
//                 size={isMobile ? "medium" : "large"}
//                 className="rounded-full px-6 sm:px-8 py-2.5 sm:py-3 border-amber-500 text-amber-500 hover:bg-amber-50"
//               >
//                 Explore Recipes
//               </Button>
//             </motion.div>
//           </motion.div>

//           {/* Enhanced Hero Image */}
//           <motion.div 
//             className="w-full md:w-5/12 lg:w-6/12 mt-16 md:mt-0 px-4 md:px-6"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.5, duration: 0.8 }}
//           >
//             <div className="relative mx-auto max-w-md">
//               {/* Main Image Frame with improved shadow and border */}
//               <div className="relative z-20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,112,184,0.1)] border border-white/40 transform hover:scale-105 transition-transform duration-300">
//                 <img
//                   src={beans}
//                   alt="Delicious food presentation"
//                   className="w-full h-auto object-cover"
//                 />
                
//                 {/* Fixed positioning of floating badges */}
//                 <motion.div
//                   className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-2.5 flex items-center z-30"
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 1.2, duration: 0.5 }}
//                 >
//                   <div className="p-4 bg-red-100 rounded-full mr-2">
//                     <Favorite className="text-red-500 w-5 h-5" />
//                   </div>
//                   <span className="text-sm font-semibold whitespace-nowrap">2.5k Favorites</span>
//                 </motion.div>
                
//                 <motion.div
//                   className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-2.5 flex items-center z-30"
//                   initial={{ y: 20, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   transition={{ delay: 1.4, duration: 0.5 }}
//                 >
//                   <div className="p-1.5 bg-amber-100 rounded-full mr-2">
//                     <StarIcon className="text-amber-500 w-5 h-5" />
//                   </div>
//                   <span className="text-sm font-semibold whitespace-nowrap">4.9 (1,432 Ratings)</span>
//                 </motion.div>
//               </div>
              
//               {/* Improved floating food icons with better positioning */}
//               <motion.div
//                 className="absolute -top-14 -left-14 w-20 h-20 bg-white p-3 rounded-full shadow-lg z-10 border-4 border-purple-100"
//                 animate={{
//                   y: [0, -15, 0],
//                 }}
//                 transition={{
//                   duration: 3,
//                   repeat: Infinity,
//                   repeatType: "reverse"
//                 }}
//               >
//                 <img src={delicious} alt="Food icon" className="w-full h-full object-contain" />
//               </motion.div>
              
//               <motion.div
//                 className="absolute bottom-16 -right-16 w-28 h-28 bg-white p-4 rounded-full shadow-lg z-10 border-4 border-amber-100"
//                 animate={{
//                   y: [0, 15, 0],
//                 }}
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   repeatType: "reverse",
//                   delay: 0.5
//                 }}
//               >
//                 <img src={plantain} alt="Food icon" className="w-full h-full object-contain" />
//               </motion.div>

//               {/* Additional floating element for visual interest */}
//               <motion.div
//                 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-36 w-16 h-16 bg-white p-2 rounded-full shadow-lg z-10 border-4 border-pink-100 hidden md:block"
//                 animate={{
//                   x: ['-50%', '-40%', '-50%'],
//                   y: ['-150%', '-170%', '-150%'],
//                 }}
//                 transition={{
//                   duration: 5,
//                   repeat: Infinity,
//                   repeatType: "reverse",
//                   delay: 1.2
//                 }}
//               >
//                 <img src={plantain} alt="Food icon" className="w-full h-full object-contain" />
//               </motion.div>
//             </div>
//           </motion.div>
//         </div>
      
//     </div>
//   );
// };

// export default HeroSection;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Typography, 
  Button,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight, RestaurantMenu, Public, Star } from '@mui/icons-material';
import { beans, plantain, delicious } from "./images";

const HeroCarousel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const carouselItems = [
    {
      id: 1,
      image: beans,
      title: "Experience the Rich Flavors of Africa",
      subtitle: "From spicy jollof rice to savory egusi soup - taste the authentic heritage",
      tag: "African Cuisine",
      cta: "Explore African Dishes",
      color: "from-red-600 to-red-800"
    },
    {
      id: 2,
      image: delicious,
      title: "World-Class Recipes at Your Fingertips",
      subtitle: "Master Italian pasta, Japanese sushi, Indian curry & more in your own kitchen",
      tag: "International Dishes",
      cta: "Discover Global Flavors",
      color: "from-red-600 to-orange-600"
    },
    {
      id: 3,
      image: plantain,
      title: "Join 10,000+ Food Enthusiasts",
      subtitle: "Share your creations, get personalized recommendations & learn from top chefs",
      tag: "Culinary Community",
      cta: "Sign Up Now",
      color: "from-red-600 to-red-700"
    }
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      nextSlide();
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slideVariants = {
    enter: (direction:any) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction:any) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0
    })
  };

  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse"
    }
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[75vh] overflow-hidden">
      {/* Carousel controls */}
      <div className="absolute inset-x-0 top-1/2 flex justify-between items-center z-30 px-4 md:px-10">
        <IconButton 
          onClick={prevSlide}
          className="bg-white/90 hover:bg-white shadow-lg text-red-600 rounded-full p-2"
          size={isMobile ? "medium" : "large"}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        <IconButton 
          onClick={nextSlide}
          className="bg-white/90 hover:bg-white shadow-lg text-red-600 rounded-full p-2"
          size={isMobile ? "medium" : "large"}
        >
          <ChevronRight fontSize="large" />
        </IconButton>
      </div>
      
      {/* Carousel indicators */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-3 z-30">
        {carouselItems.map((_, index) => (
          <button
            key={`indicator-${index}`}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`h-3 rounded-full transition-all duration-300 border-2 border-white shadow-md ${
              index === currentSlide 
                ? `w-10 bg-red-600` 
 : `w-3 bg-white hover:bg-red-400`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Carousel slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "tween",
            duration: 0.8,
            ease: "easeInOut"
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60 z-10" />
            <img 
              src={carouselItems[currentSlide].image} 
              alt={carouselItems[currentSlide].title}
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          <div className="relative z-20 flex flex-col justify-center h-full px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
            <motion.div
              className="absolute -top-4 right-16 md:right-24 w-16 h-16 md:w-24 md:h-24 bg-white p-2 rounded-full shadow-xl border-4 border-red-600/30 hidden md:block"
              animate={floatAnimation}
            >
              {currentSlide === 0 ? (
                <RestaurantMenu className="w-full h-full text-red-600" />
              ) : currentSlide === 1 ? (
                <Public className="w-full h-full text-red-600" />
              ) : (
                <Star className="w-full h-full text-red-600" />
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Typography
                component="h2"
                className={`inline-block px-4 py-2 mb-4 rounded-lg bg-gradient-to-r ${carouselItems[currentSlide].color} text-white text-sm md:text-base font-medium`}
              >
                {carouselItems[currentSlide].tag}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Typography
                component="h1"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 max-w-4xl leading-tight"
              >
                {carouselItems[currentSlide].title}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <Typography
                component="p"
                className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl"
              >
                {carouselItems[currentSlide].subtitle}
              </Typography>
              
              <Typography
                component="p"
                className="text-base md:text-lg text-white/80 mb-8 max-w-2xl italic"
              >
                {currentSlide === 0 
                  ? "Every dish tells a story of tradition, culture, and flavor that spans generations."
                  : currentSlide === 1 
                  ? "Travel the world through your taste buds without leaving your kitchen."
                  : "Join a supportive community that celebrates diversity through the universal language of food."}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"}
                className={`bg-gradient-to-r ${carouselItems[currentSlide].color} hover:shadow-lg rounded-full px-6 sm:px-8 py-3 text-white font-medium transition-all duration-300`}
              >
                {carouselItems[currentSlide].cta}
              </Button>
              
              <Button
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                className="border-white text-white hover:bg-white/10 rounded-full px-6 sm:px-8 py-3 transition-all duration-300"
              >
                {currentSlide === 0 
                  ? "Watch Cooking Demo" 
                  : currentSlide === 1 
                  ? "Browse Recipe Collection"
                  : "See Success Stories"}
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="flex flex-wrap gap-4 mt-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm flex items-center">
                <span className="font-bold mr-1">{currentSlide === 0 ? "500+" : currentSlide === 1 ? "1,200+" : "24/7"}</span> 
                {currentSlide === 0 ? "African Recipes" : currentSlide === 1 ? "Global Dishes" : "Expert Support"}
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm flex items-center">
                <span className="font-bold mr-1">{currentSlide === 0 ? "4.9" : currentSlide === 1 ? "35+" : "10K+"}</span>
                {currentSlide === 0 ? "Average Rating" : currentSlide === 1 ? "Countries Represented" : "Active Members"}
              </div>
            </motion.div>
          </div>
          
          {/* Decorative floating elements */}
          {!isMobile && (
            <>
              <motion.div
                className="absolute top-1/4 left-16 w-12 h-12 rounded-full bg-red-600/30 backdrop-blur-md z-10"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div
                className="absolute bottom-1/4 right-24 w-16 h-16 rounded-full bg-red-600/20 backdrop-blur-md z-10"
                animate={{
                  y: [0, 20, 0],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HeroCarousel;