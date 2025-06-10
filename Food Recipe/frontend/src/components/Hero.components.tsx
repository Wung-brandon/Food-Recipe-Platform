import React, { useState } from "react";
import { Button, Typography, Box, InputBase, IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import { 
  spaghetti, ekwang, katikati, njama, pizza, 
  hamburger, ndole, achu, oslun, pepperBeef 
} from "./images";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface FoodImage {
  id: number;
  src: string;
  alt: string;
}

const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const foodImages: FoodImage[] = [
    { id: 1, src: ndole, alt: "Main dish" },
    { id: 2, src: oslun, alt: "Food item 1" },
    { id: 3, src: pepperBeef, alt: "Food item 2" },
    { id: 4, src: achu, alt: "Food item 3" },
    { id: 5, src: pizza, alt: "Food item 4" },
    { id: 6, src: ekwang, alt: "Food item 5" },
    { id: 7, src: hamburger, alt: "Food item 6" },
    { id: 8, src: njama, alt: "Food item 7" },
    { id: 9, src: katikati, alt: "Food item 8" },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Search submitted:', searchValue);
    // Implement your search functionality here
  };

  const navigate = useNavigate();

  return (
    <div className="bg-amber-100">
      <Box className="flex justify-between py-[50px]">
        {/* Left Content */}
        <Box className="md:w-1/2 max-w-md mx-[80px] my-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" className="text-amber-600 font-bold mb-2">
              Health Requires Healthy Food
            </Typography>
            <Typography variant="h6" className="mb-8 text-gray-600 max-w-xl mx-auto md:mx-0">
              Manage your recipes the easy way
            </Typography>
            <Typography 
              variant="body2" 
              className="mb-8 text-gray-600 max-w-xl mx-auto md:mx-0"
              sx={{ fontSize: {xs: '1rem', md: '1.125rem'} }}
            >
              Join our community of food lovers to find inspiration, share your culinary creations, and explore thousands of recipes from around the world. Whether you're a novice cook or a seasoned chef, there's something for everyone here.
            </Typography>
            

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="my-6">
              <div className="flex items-center w-full bg-white border-2 border-amber-400 rounded-full overflow-hidden px-4 py-1 focus-within:ring-2 focus-within:ring-amber-300 transition-all shadow-sm">
                <IconButton>
                  <Search className="text-amber-600 mr-2" />
                </IconButton>
                <InputBase
                  placeholder="Search for recipes..."
                  className="flex-1"
                  value={searchValue}
                  onChange={handleSearchChange}
                  inputProps={{ 
                    'aria-label': 'search recipes',
                    className: 'py-2 w-full focus:outline-none text-amber-900 placeholder-amber-400'
                  }}
                />
              </div>
            </form>

            <div className="flex gap-10">
              <Button 
                variant="contained" 
                className="rounded-full text-black hover:text-white px-8 py-3 uppercase text-sm font-medium"
                sx={{
                  border: "1px solid #D97706",
                  backgroundColor: '#fff',
                  borderRadius: '9999px',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#B45309',
                    color: '#FFFFFF',
                  },
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  paddingX: 4,
                  paddingY: 1.5,
                }}
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button 
                variant="contained" 
                className="rounded-full text-white px-8 py-3 uppercase text-sm font-medium"
                sx={{
                  backgroundColor: '#D97706',
                  borderRadius: '9999px',
                  '&:hover': {
                    backgroundColor: '#B45309',
                  },
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  paddingX: 4,
                  paddingY: 1.5,
                }}
                onClick={() => navigate('/explore-recipe')}
              >
                Explore Recipes
              </Button>
            </div>
          </motion.div>
        </Box>

        {/* Right Side Image Grid */}
        <Box className="md:w-1/2 flex">
          <Box sx={{ display: "flex", flexDirection: "row", gap: "6px", width: "100%" }}>
            {/* Column 1 - Smallest height */}
            <Box sx={{ width: "20%", display: "flex", flexDirection: "column", gap: "6px", marginTop: '210px'}}>
              <motion.img
                src={foodImages[0].src}
                alt={foodImages[0].alt}
                className="rounded-lg object-cover w-full"
                style={{ height: "80px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Box>

            {/* Column 2 - Taller than Column 1 */}
            <Box sx={{ width: "20%", display: "flex", flexDirection: "column", gap: "6px", marginTop: '140px' }}>
              <motion.img
                src={foodImages[1].src}
                alt={foodImages[1].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "100px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={foodImages[2].src}
                alt={foodImages[2].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "100px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Box>

            {/* Column 3 - Taller than Column 2 */}
            <Box sx={{ width: "20%", display: "flex", flexDirection: "column", gap: "6px", marginTop: '60px' }}>
              <motion.img
                src={foodImages[3].src}
                alt={foodImages[3].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "120px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={foodImages[4].src}
                alt={foodImages[4].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "120px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={foodImages[5].src}
                alt={foodImages[5].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "120px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Box>

            {/* Column 4 - Taller than Column 3 */}
            <Box sx={{ width: "20%", display: "flex", flexDirection: "column", gap: "6px" }}>
              <motion.img
                src={foodImages[6].src}
                alt={foodImages[6].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "160px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={foodImages[7].src}
                alt={foodImages[7].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "160px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.img
                src={foodImages[8].src}
                alt={foodImages[8].alt} 
                className="rounded-lg object-cover w-full" 
                style={{ height: "160px" }} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default HeroSection;